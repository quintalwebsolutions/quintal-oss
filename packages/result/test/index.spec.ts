import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { AnyResult, Result, asyncResult, err, ok, result } from '../src';

// Source https://www.totaltypescript.com/how-to-test-your-types
type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

type And<X extends boolean, Y extends boolean> = X extends true
  ? Y extends true
    ? true
    : false
  : false;

function expectResultUnwrap<TResult extends AnyResult>(_result: TResult) {
  return {
    toBe: <TUnwrap, TUnwrapErr>(
      _val: And<
        Equal<ReturnType<TResult['unwrap']>, TUnwrap>,
        Equal<ReturnType<TResult['unwrapErr']>, TUnwrapErr>
      >,
    ) => {},
  };
}

function throwSync(): 'value' {
  throw new Error('error');
}

function noThrowSync(): 'value' {
  return 'value';
}

async function throwAsync(): Promise<'value'> {
  throw new Error('error');
}

async function noThrowAsync(): Promise<'value'> {
  return 'value';
}

const okValue = ok('value' as const);
const errValue = err('error' as const);
const earlyOk = ok('early' as const);
const earlyErr = err('early' as const);
const lateOk = ok('late' as const);
const lateErr = err('late' as const);
const okRes1 = ok('value1') as Result<'value1', 'error1'>;
const okRes2 = ok('value2') as Result<'value2', 'error2'>;
const errRes1 = err('error1') as Result<'value1', 'error1'>;
const errRes2 = err('error2') as Result<'value2', 'error2'>;
const okResValue = result(noThrowSync);
const errResValue = result(throwSync);

describe('Result', () => {
  it('Is able to create type-safe `ok` and `err` values', () => {
    const resultValue = result(noThrowSync);

    expectTypeOf(okValue.isOk).toEqualTypeOf<true>();
    expect(okValue.isOk).toBe(true);
    expectTypeOf(okValue.isErr).toEqualTypeOf<false>();
    expect(okValue.isErr).toBe(false);

    expectTypeOf(errValue.isOk).toEqualTypeOf<false>();
    expect(errValue.isOk).toBe(false);
    expectTypeOf(errValue.isErr).toEqualTypeOf<true>();
    expect(errValue.isErr).toBe(true);

    expectTypeOf(resultValue.isOk).toEqualTypeOf<boolean>();
    expect(resultValue.isOk).toBe(true);
    expectTypeOf(resultValue.isErr).toEqualTypeOf<boolean>();
    expect(resultValue.isErr).toBe(false);
  });

  it('Allows to type-narrow a generic result type', () => {
    const unknownResult = result(noThrowSync);
    expectResultUnwrap(unknownResult).toBe<'value', unknown>(true);
    if (unknownResult.isOk) {
      expectResultUnwrap(unknownResult).toBe<'value', never>(true);
    } else {
      expectResultUnwrap(unknownResult).toBe<never, unknown>(true);
    }
  });

  it('Allows to unwrap the result value with a custom error message', async () => {
    expect(okValue.expect('Should be ok')).toBe('value');
    expect(() => okValue.expectErr('Should be error')).toThrow('Should be error');

    expect(() => errValue.expect('Should be ok')).toThrow('Should be ok');
    expect(errValue.expectErr('Should be error')).toBe('error');

    expect(okResValue.expect('Should be ok')).toBe('value');
    expect(() => okResValue.expectErr('Should be error')).toThrow('Should be error');

    expect(() => errResValue.expect('Should be ok')).toThrow('Should be ok');
    expect(errResValue.expectErr('Should be error')).toStrictEqual(Error('error'));

    const asyncOkResultValue = await asyncResult(noThrowAsync);
    expect(asyncOkResultValue.expect('Should be ok')).toBe('value');
    expect(() => asyncOkResultValue.expectErr('Should be error')).toThrow('Should be error');

    const asyncErrResultValue = await asyncResult(throwAsync);
    expect(() => asyncErrResultValue.expect('Should be ok')).toThrow('Should be ok');
    expect(asyncErrResultValue.expectErr('Should be error')).toStrictEqual(Error('error'));
  });

  it('Allows to unwrap the result value', async () => {
    expectResultUnwrap(okValue).toBe<'value', never>(true);
    expect(okValue.unwrap()).toBe('value');
    expect(okValue.unwrapErr).toThrowErrorMatchingInlineSnapshot('"value"');

    expectResultUnwrap(errValue).toBe<never, 'error'>(true);
    expect(errValue.unwrap).toThrow('error');
    expect(errValue.unwrapErr()).toBe('error');

    expectResultUnwrap(okResValue).toBe<'value', unknown>(true);
    expect(okResValue.unwrap()).toBe('value');
    expect(okResValue.unwrapErr).toThrowErrorMatchingInlineSnapshot('"value"');

    expectResultUnwrap(errResValue).toBe<'value', unknown>(true);
    expect(errResValue.unwrap).toThrow('error');
    expect(errResValue.unwrapErr()).toStrictEqual(Error('error'));

    const asyncOkResultValue = await asyncResult(noThrowAsync);
    expectResultUnwrap(asyncOkResultValue).toBe<'value', unknown>(true);
    expect(asyncOkResultValue.unwrap()).toBe('value');
    expect(asyncOkResultValue.unwrapErr).toThrowErrorMatchingInlineSnapshot('"value"');

    const asyncErrResultValue = await asyncResult(throwAsync);
    expectResultUnwrap(asyncErrResultValue).toBe<'value', unknown>(true);
    expect(asyncErrResultValue.unwrap).toThrow('error');
    expect(asyncErrResultValue.unwrapErr()).toStrictEqual(Error('error'));
  });

  it('Allows to unwrap a result value and provide a default value or compute it from a closure', () => {
    const defaultValue = 'default' as const;
    const mock = vi.fn();
    const defaultFunction = () => {
      mock();
      return defaultValue;
    };

    const okOr = okValue.unwrapOr(defaultValue);
    const okOrElse = okValue.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(0);
    expectTypeOf(okOr).toEqualTypeOf<'value'>();
    expectTypeOf(okOrElse).toEqualTypeOf<'value'>();
    expect(okOr).toBe('value');
    expect(okOrElse).toBe('value');

    const errOr = errValue.unwrapOr(defaultValue);
    const errOrElse = errValue.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(1);
    expectTypeOf(errOr).toEqualTypeOf<'default'>();
    expectTypeOf(errOrElse).toEqualTypeOf<'default'>();
    expect(errOr).toBe('default');
    expect(errOrElse).toBe('default');

    const okResOr = okRes1.unwrapOr(defaultValue);
    const okResOrElse = okRes1.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(1);
    expectTypeOf(okResOr).toEqualTypeOf<'value1' | 'default'>();
    expectTypeOf(okResOrElse).toEqualTypeOf<'value1' | 'default'>();
    expect(okResOr).toBe('value1');
    expect(okResOrElse).toBe('value1');

    const errResOr = errRes1.unwrapOr(defaultValue);
    const errResOrElse = errRes1.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(2);
    expectTypeOf(errResOr).toEqualTypeOf<'value1' | 'default'>();
    expectTypeOf(errResOrElse).toEqualTypeOf<'value1' | 'default'>();
    expect(errResOr).toBe('default');
    expect(errResOrElse).toBe('default');
  });

  it('Allows to inspect the value in the result', () => {
    const mockFn = vi.fn();

    okValue.inspect((v) => {
      expectTypeOf(v).toEqualTypeOf<'value'>();
      expect(v).toBe('value');
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    okValue.inspectErr((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    errValue.inspect((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    errValue.inspectErr((v) => {
      expectTypeOf(v).toEqualTypeOf<'error'>();
      expect(v).toBe('error');
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('Provides an `and` operation', () => {
    const okOk = earlyOk.and(lateOk);
    expectResultUnwrap(okOk).toBe<'late', never>(true);
    expect(okOk.unwrap()).toBe('late');

    const okErr = earlyOk.and(lateErr);
    expectResultUnwrap(okErr).toBe<never, 'late'>(true);
    expect(okErr.unwrapErr()).toBe('late');

    const okResOk = earlyOk.and(okRes2);
    expectResultUnwrap(okResOk).toBe<'value2', 'error2'>(true);
    expect(okResOk.unwrap()).toBe('value2');

    const okResErr = earlyOk.and(errRes2);
    expectResultUnwrap(okResErr).toBe<'value2', 'error2'>(true);
    expect(okResErr.unwrapErr()).toBe('error2');

    const errOk = earlyErr.and(lateOk);
    expectResultUnwrap(errOk).toBe<never, 'early'>(true);
    expect(errOk.unwrapErr()).toBe('early');

    const errErr = earlyErr.and(lateErr);
    expectResultUnwrap(errErr).toBe<never, 'early'>(true);
    expect(errErr.unwrapErr()).toBe('early');

    const errResOk = earlyErr.and(okRes2);
    expectResultUnwrap(errResOk).toBe<never, 'early'>(true);
    expect(errResOk.unwrapErr()).toBe('early');

    const errResErr = earlyErr.and(errRes2);
    expectResultUnwrap(errResErr).toBe<never, 'early'>(true);
    expect(errResErr.unwrapErr()).toBe('early');

    const resOkOk = okRes1.and(lateOk);
    expectResultUnwrap(resOkOk).toBe<'late', 'error1'>(true);
    expect(resOkOk.unwrap()).toBe('late');

    const resOkErr = okRes1.and(lateErr);
    expectResultUnwrap(resOkErr).toBe<never, 'error1' | 'late'>(true);
    expect(resOkErr.unwrapErr()).toBe('late');

    const resOkResOk = okRes1.and(okRes2);
    expectResultUnwrap(resOkResOk).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resOkResOk.unwrap()).toBe('value2');

    const resOkResErr = okRes1.and(errRes2);
    expectResultUnwrap(resOkResErr).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resOkResErr.unwrapErr()).toBe('error2');

    const resErrOk = errRes1.and(lateOk);
    expectResultUnwrap(resErrOk).toBe<'late', 'error1'>(true);
    expect(resErrOk.unwrapErr()).toBe('error1');

    const resErrErr = errRes1.and(lateErr);
    expectResultUnwrap(resErrErr).toBe<never, 'error1' | 'late'>(true);
    expect(resErrErr.unwrapErr()).toBe('error1');

    const resErrResOk = errRes1.and(okRes2);
    expectResultUnwrap(resErrResOk).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resErrResOk.unwrapErr()).toBe('error1');

    const resErrResErr = errRes1.and(errRes2);
    expectResultUnwrap(resErrResErr).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resErrResErr.unwrapErr()).toBe('error1');
  });

  it('Provides an `andThen` operation', () => {
    const okOk = earlyOk.andThen(() => lateOk);
    expectResultUnwrap(okOk).toBe<'late', never>(true);
    expect(okOk.unwrap()).toBe('late');

    const okErr = earlyOk.andThen(() => lateErr);
    expectResultUnwrap(okErr).toBe<never, 'late'>(true);
    expect(okErr.unwrapErr()).toBe('late');

    const okResOk = earlyOk.andThen(() => okRes2);
    expectResultUnwrap(okResOk).toBe<'value2', 'error2'>(true);
    expect(okResOk.unwrap()).toBe('value2');

    const okResErr = earlyOk.andThen(() => errRes2);
    expectResultUnwrap(okResErr).toBe<'value2', 'error2'>(true);
    expect(okResErr.unwrapErr()).toBe('error2');

    const errOk = earlyErr.andThen(() => lateOk);
    expectResultUnwrap(errOk).toBe<never, 'early'>(true);
    expect(errOk.unwrapErr()).toBe('early');

    const errErr = earlyErr.andThen(() => lateErr);
    expectResultUnwrap(errErr).toBe<never, 'early'>(true);
    expect(errErr.unwrapErr()).toBe('early');

    const errResOk = earlyErr.andThen(() => okRes2);
    expectResultUnwrap(errResOk).toBe<never, 'early'>(true);
    expect(errResOk.unwrapErr()).toBe('early');

    const errResErr = earlyErr.andThen(() => errRes2);
    expectResultUnwrap(errResErr).toBe<never, 'early'>(true);
    expect(errResErr.unwrapErr()).toBe('early');

    const resOkOk = okRes1.andThen(() => lateOk);
    expectResultUnwrap(resOkOk).toBe<'late', 'error1'>(true);
    expect(resOkOk.unwrap()).toBe('late');

    const resOkErr = okRes1.andThen(() => lateErr);
    expectResultUnwrap(resOkErr).toBe<never, 'error1' | 'late'>(true);
    expect(resOkErr.unwrapErr()).toBe('late');

    const resOkResOk = okRes1.andThen(() => okRes2);
    expectResultUnwrap(resOkResOk).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resOkResOk.unwrap()).toBe('value2');

    const resOkResErr = okRes1.andThen(() => errRes2);
    expectResultUnwrap(resOkResErr).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resOkResErr.unwrapErr()).toBe('error2');

    const resErrOk = errRes1.andThen(() => lateOk);
    expectResultUnwrap(resErrOk).toBe<'late', 'error1'>(true);
    expect(resErrOk.unwrapErr()).toBe('error1');

    const resErrErr = errRes1.andThen(() => lateErr);
    expectResultUnwrap(resErrErr).toBe<never, 'error1' | 'late'>(true);
    expect(resErrErr.unwrapErr()).toBe('error1');

    const resErrResOk = errRes1.andThen(() => okRes2);
    expectResultUnwrap(resErrResOk).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resErrResOk.unwrapErr()).toBe('error1');

    const resErrResErr = errRes1.andThen(() => errRes2);
    expectResultUnwrap(resErrResErr).toBe<'value2', 'error1' | 'error2'>(true);
    expect(resErrResErr.unwrapErr()).toBe('error1');
  });

  it('Provides an `or` operation', () => {
    const okOk = earlyOk.or(lateOk);
    expectResultUnwrap(okOk).toBe<'early', never>(true);
    expect(okOk.unwrap()).toBe('early');

    const okErr = earlyOk.or(lateErr);
    expectResultUnwrap(okErr).toBe<'early', never>(true);
    expect(okErr.unwrap()).toBe('early');

    const okResOk = earlyOk.or(okRes2);
    expectResultUnwrap(okResOk).toBe<'early', never>(true);
    expect(okResOk.unwrap()).toBe('early');

    const okResErr = earlyOk.or(errRes2);
    expectResultUnwrap(okResErr).toBe<'early', never>(true);
    expect(okResErr.unwrap()).toBe('early');

    const errOk = earlyErr.or(lateOk);
    expectResultUnwrap(errOk).toBe<'late', never>(true);
    expect(errOk.unwrap()).toBe('late');

    const errErr = earlyErr.or(lateErr);
    expectResultUnwrap(errErr).toBe<never, 'late'>(true);
    expect(errErr.unwrapErr()).toBe('late');

    const errResOk = earlyErr.or(okRes2);
    expectResultUnwrap(errResOk).toBe<'value2', 'error2'>(true);
    expect(errResOk.unwrap()).toBe('value2');

    const errResErr = earlyErr.or(errRes2);
    expectResultUnwrap(errResErr).toBe<'value2', 'error2'>(true);
    expect(errResErr.unwrapErr()).toBe('error2');

    const resOkOk = okRes1.or(lateOk);
    expectResultUnwrap(resOkOk).toBe<'value1' | 'late', never>(true);
    expect(resOkOk.unwrap()).toBe('value1');

    const resOkErr = okRes1.or(lateErr);
    expectResultUnwrap(resOkErr).toBe<'value1', 'late'>(true);
    expect(resOkErr.unwrap()).toBe('value1');

    const resOkResOk = okRes1.or(okRes2);
    expectResultUnwrap(resOkResOk).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resOkResOk.unwrap()).toBe('value1');

    const resOkResErr = okRes1.or(errRes2);
    expectResultUnwrap(resOkResErr).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resOkResErr.unwrap()).toBe('value1');

    const resErrOk = errRes1.or(lateOk);
    expectResultUnwrap(resErrOk).toBe<'value1' | 'late', never>(true);
    expect(resErrOk.unwrap()).toBe('late');

    const resErrErr = errRes1.or(lateErr);
    expectResultUnwrap(resErrErr).toBe<'value1', 'late'>(true);
    expect(resErrErr.unwrapErr()).toBe('late');

    const resErrResOk = errRes1.or(okRes2);
    expectResultUnwrap(resErrResOk).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resErrResOk.unwrap()).toBe('value2');

    const resErrResErr = errRes1.or(errRes2);
    expectResultUnwrap(resErrResErr).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resErrResErr.unwrapErr()).toBe('error2');
  });

  it('Provides an `orElse` operation', () => {
    const okOk = earlyOk.orElse(() => lateOk);
    expectResultUnwrap(okOk).toBe<'early', never>(true);
    expect(okOk.unwrap()).toBe('early');

    const okErr = earlyOk.orElse(() => lateErr);
    expectResultUnwrap(okErr).toBe<'early', never>(true);
    expect(okErr.unwrap()).toBe('early');

    const okResOk = earlyOk.orElse(() => okRes2);
    expectResultUnwrap(okResOk).toBe<'early', never>(true);
    expect(okResOk.unwrap()).toBe('early');

    const okResErr = earlyOk.orElse(() => errRes2);
    expectResultUnwrap(okResErr).toBe<'early', never>(true);
    expect(okResErr.unwrap()).toBe('early');

    const errOk = earlyErr.orElse(() => lateOk);
    expectResultUnwrap(errOk).toBe<'late', never>(true);
    expect(errOk.unwrap()).toBe('late');

    const errErr = earlyErr.orElse(() => lateErr);
    expectResultUnwrap(errErr).toBe<never, 'late'>(true);
    expect(errErr.unwrapErr()).toBe('late');

    const errResOk = earlyErr.orElse(() => okRes2);
    expectResultUnwrap(errResOk).toBe<'value2', 'error2'>(true);
    expect(errResOk.unwrap()).toBe('value2');

    const errResErr = earlyErr.orElse(() => errRes2);
    expectResultUnwrap(errResErr).toBe<'value2', 'error2'>(true);
    expect(errResErr.unwrapErr()).toBe('error2');

    const resOkOk = okRes1.orElse(() => lateOk);
    expectResultUnwrap(resOkOk).toBe<'value1' | 'late', never>(true);
    expect(resOkOk.unwrap()).toBe('value1');

    const resOkErr = okRes1.orElse(() => lateErr);
    expectResultUnwrap(resOkErr).toBe<'value1', 'late'>(true);
    expect(resOkErr.unwrap()).toBe('value1');

    const resOkResOk = okRes1.orElse(() => okRes2);
    expectResultUnwrap(resOkResOk).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resOkResOk.unwrap()).toBe('value1');

    const resOkResErr = okRes1.orElse(() => errRes2);
    expectResultUnwrap(resOkResErr).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resOkResErr.unwrap()).toBe('value1');

    const resErrOk = errRes1.orElse(() => lateOk);
    expectResultUnwrap(resErrOk).toBe<'value1' | 'late', never>(true);
    expect(resErrOk.unwrap()).toBe('late');

    const resErrErr = errRes1.orElse(() => lateErr);
    expectResultUnwrap(resErrErr).toBe<'value1', 'late'>(true);
    expect(resErrErr.unwrapErr()).toBe('late');

    const resErrResOk = errRes1.orElse(() => okRes2);
    expectResultUnwrap(resErrResOk).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resErrResOk.unwrap()).toBe('value2');

    const resErrResErr = errRes1.orElse(() => errRes2);
    expectResultUnwrap(resErrResErr).toBe<'value1' | 'value2', 'error2'>(true);
    expect(resErrResErr.unwrapErr()).toBe('error2');
  });

  it('Provides a `map` operation for `ok` and `err` values', () => {
    const mapFn = (v: string) => v === 'value';
    const mapErrFn = (v: unknown) =>
      v === 'error' ? ('new-error' as const) : ('old-error' as const);

    const okMapped = okValue.map(mapFn);
    expectResultUnwrap(okMapped).toBe<boolean, never>(true);
    expect(okMapped.unwrap()).toBe(true);
    const okMappedErr = okValue.mapErr(mapErrFn);
    expectResultUnwrap(okMappedErr).toBe<'value', never>(true);
    expect(okMappedErr.unwrap()).toBe('value');

    const errMapped = errValue.map(mapFn);
    expectResultUnwrap(errMapped).toBe<never, 'error'>(true);
    expect(errMapped.unwrapErr()).toBe('error');
    const errMappedErr = errValue.mapErr(mapErrFn);
    expectResultUnwrap(errMappedErr).toBe<never, 'new-error' | 'old-error'>(true);
    expect(errMappedErr.unwrapErr()).toBe('new-error');

    const okResultMapped = okResValue.map(mapFn);
    expectResultUnwrap(okResultMapped).toBe<boolean, unknown>(true);
    expect(okResultMapped.unwrap()).toBe(true);
    const okResultMappedErr = okResValue.mapErr(mapErrFn);
    expectResultUnwrap(okResultMappedErr).toBe<'value', 'new-error' | 'old-error'>(true);
    expect(okResultMappedErr.unwrap()).toBe('value');

    const errResultMapped = errResValue.map(mapFn);
    expectResultUnwrap(errResultMapped).toBe<boolean, unknown>(true);
    expect(errResultMapped.unwrapErr()).toStrictEqual(Error('error'));
    const errResultMappedErr = errResValue.mapErr(mapErrFn);
    expectResultUnwrap(errResultMappedErr).toBe<'value', 'new-error' | 'old-error'>(true);
    expect(errResultMappedErr.unwrapErr()).toStrictEqual('old-error');
  });

  it('mapOr should return the mapped value for ok and default value for err', () => {
    const mapFn = (v: string) => (v === 'value' ? 1 : 2);
    const expectMappedType = (v: 0 | 1 | 2) => v;

    const okMapped = okValue.mapOr(0, mapFn);
    expectMappedType(okMapped);
    expect(okMapped).toBe(1);

    const errMapped = errValue.mapOr(0, mapFn);
    expectMappedType(errMapped);
    expect(errMapped).toBe(0);

    const okResultMapped = okResValue.mapOr(0, mapFn);
    expectMappedType(okResultMapped);
    expect(okResultMapped).toBe(1);

    const errResultMapped = errResValue.mapOr(0, mapFn);
    expectMappedType(errResultMapped);
    expect(errResultMapped).toBe(0);
  });

  it('mapOrElse should return the mapped value for ok and computed default for err', () => {
    const mapFn = (v: string) => (v === 'value' ? 1 : 2);
    const expectMappedType = (v: 0 | 1 | 2) => v;

    const okMapped = okValue.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(okMapped);
    expect(okMapped).toBe(1);

    const errMapped = errValue.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(errMapped);
    expect(errMapped).toBe(0);

    const okResultMapped = okResValue.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(okResultMapped);
    expect(okResultMapped).toBe(1);

    const errResultMapped = errResValue.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(errResultMapped);
    expect(errResultMapped).toBe(0);
  });

  it('Provides an `isOkAnd` operation', () => {
    const pTrue = () => true;
    const pFalse = () => false;

    const okTrue = okValue.isOkAnd(pTrue);
    expect(okTrue).toBe(true);
    const okFalse = okValue.isOkAnd(pFalse);
    expect(okFalse).toBe(false);

    const errTrue = errValue.isOkAnd(pTrue);
    expect(errTrue).toBe(false);
    const errFalse = errValue.isOkAnd(pFalse);
    expect(errFalse).toBe(false);

    const okResultTrue = okResValue.isOkAnd(pTrue);
    expect(okResultTrue).toBe(true);
    const okResultFalse = okResValue.isOkAnd(pFalse);
    expect(okResultFalse).toBe(false);

    const errResultTrue = errResValue.isOkAnd(pTrue);
    expect(errResultTrue).toBe(false);
    const errResultFalse = errResValue.isOkAnd(pFalse);
    expect(errResultFalse).toBe(false);
  });

  it('Provides an `isErrAnd` operation', () => {
    const pTrue = () => true;
    const pFalse = () => false;

    const okTrue = okValue.isErrAnd(pTrue);
    expect(okTrue).toBe(false);
    const okFalse = okValue.isErrAnd(pFalse);
    expect(okFalse).toBe(false);

    const errTrue = errValue.isErrAnd(pTrue);
    expect(errTrue).toBe(true);
    const errFalse = errValue.isErrAnd(pFalse);
    expect(errFalse).toBe(false);

    const okResultTrue = okResValue.isErrAnd(pTrue);
    expect(okResultTrue).toBe(false);
    const okResultFalse = okResValue.isErrAnd(pFalse);
    expect(okResultFalse).toBe(false);

    const errResultTrue = errResValue.isErrAnd(pTrue);
    expect(errResultTrue).toBe(true);
    const errResultFalse = errResValue.isErrAnd(pFalse);
    expect(errResultFalse).toBe(false);
  });
});
