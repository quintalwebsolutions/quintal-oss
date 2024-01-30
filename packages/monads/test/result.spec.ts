import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { AnyResult, Err, Ok, Result, err, ok, result } from '../src';
import { None, Option, Some, none, some } from '../src/option';
import { And, Equal } from '../src/util';

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

function returns(): 'value' {
  return 'value';
}

function throws(): 'value' {
  throw new Error('error');
}

// TODO proof of concept
// async function returnsAsync(): Promise<'value'> {
//   return 'value';
// }

// async function throwsAsync(): Promise<'value'> {
//   throw new Error('error');
// }

const okVal = ok('value' as const);
const errVal = err('error' as const);
const earlyOk = ok('early' as const);
const earlyErr = err('early' as const);
const lateOk = ok('late' as const);
const lateErr = err('late' as const);
const okRes1 = ok('value1') as Result<'value1', 'error1'>;
const okRes2 = ok('value2') as Result<'value2', 'error2'>;
const errRes1 = err('error1') as Result<'value1', 'error1'>;
const errRes2 = err('error2') as Result<'value2', 'error2'>;
const okResVal = result(returns);
const errResVal = result(throws);

describe('Result', () => {
  it('should have type-safe `ok` and `err` states', () => {
    expectTypeOf(okVal.isOk).toEqualTypeOf<true>();
    expect(okVal.isOk).toBe(true);
    expectTypeOf(okVal.isErr).toEqualTypeOf<false>();
    expect(okVal.isErr).toBe(false);

    expectTypeOf(errVal.isOk).toEqualTypeOf<false>();
    expect(errVal.isOk).toBe(false);
    expectTypeOf(errVal.isErr).toEqualTypeOf<true>();
    expect(errVal.isErr).toBe(true);

    expectTypeOf(okResVal.isOk).toEqualTypeOf<boolean>();
    expect(okResVal.isOk).toBe(true);
    expectTypeOf(okResVal.isErr).toEqualTypeOf<boolean>();
    expect(okResVal.isErr).toBe(false);
  });

  it('should type-narrow based on `isOk` and `isErr` checks', () => {
    expectResultUnwrap(okResVal).toBe<'value', unknown>(true);
    expectTypeOf(okResVal).not.toHaveProperty('value');
    expectTypeOf(okResVal).not.toHaveProperty('error');

    if (okResVal.isOk) {
      expectResultUnwrap(okResVal).toBe<'value', never>(true);
      expectTypeOf(okResVal).toHaveProperty('value');
    } else {
      expectResultUnwrap(okResVal).toBe<never, unknown>(true);
      expectTypeOf(okResVal).toHaveProperty('error');
    }
  });

  it('should validate `ok` values against predicates with `isOkAnd`', () => {
    const pTrue = () => true;
    const pFalse = () => false;

    const okTrue = okVal.isOkAnd(pTrue);
    expect(okTrue).toBe(true);
    const okFalse = okVal.isOkAnd(pFalse);
    expect(okFalse).toBe(false);

    const errTrue = errVal.isOkAnd(pTrue);
    expect(errTrue).toBe(false);
    const errFalse = errVal.isOkAnd(pFalse);
    expect(errFalse).toBe(false);

    const okResultTrue = okResVal.isOkAnd(pTrue);
    expect(okResultTrue).toBe(true);
    const okResultFalse = okResVal.isOkAnd(pFalse);
    expect(okResultFalse).toBe(false);

    const errResultTrue = errResVal.isOkAnd(pTrue);
    expect(errResultTrue).toBe(false);
    const errResultFalse = errResVal.isOkAnd(pFalse);
    expect(errResultFalse).toBe(false);
  });

  it('should validate `err` values against predicates with `isErrAnd`', () => {
    const pTrue = () => true;
    const pFalse = () => false;

    const okTrue = okVal.isErrAnd(pTrue);
    expect(okTrue).toBe(false);
    const okFalse = okVal.isErrAnd(pFalse);
    expect(okFalse).toBe(false);

    const errTrue = errVal.isErrAnd(pTrue);
    expect(errTrue).toBe(true);
    const errFalse = errVal.isErrAnd(pFalse);
    expect(errFalse).toBe(false);

    const okResultTrue = okResVal.isErrAnd(pTrue);
    expect(okResultTrue).toBe(false);
    const okResultFalse = okResVal.isErrAnd(pFalse);
    expect(okResultFalse).toBe(false);

    const errResultTrue = errResVal.isErrAnd(pTrue);
    expect(errResultTrue).toBe(true);
    const errResultFalse = errResVal.isErrAnd(pFalse);
    expect(errResultFalse).toBe(false);
  });

  it('should facilityate inspection of `ok` and `err` values with `inspect` and `inspectErr`', () => {
    const mockFn = vi.fn();

    okVal.inspect((v) => {
      expectTypeOf(v).toEqualTypeOf<'value'>();
      expect(v).toBe('value');
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    okVal.inspectErr((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    errVal.inspect((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    errVal.inspectErr((v) => {
      expectTypeOf(v).toEqualTypeOf<'error'>();
      expect(v).toBe('error');
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should unwrap the contained value or throw a custom error with `expect` and `expectErr`', () => {
    expect(okVal.expect('Should be ok')).toBe('value');
    expect(() => okVal.expectErr('Should be error')).toThrow('Should be error');

    expect(() => errVal.expect('Should be ok')).toThrow('Should be ok');
    expect(errVal.expectErr('Should be error')).toBe('error');

    expect(okResVal.expect('Should be ok')).toBe('value');
    expect(() => okResVal.expectErr('Should be error')).toThrow('Should be error');

    expect(() => errResVal.expect('Should be ok')).toThrow('Should be ok');
    expect(errResVal.expectErr('Should be error')).toStrictEqual(Error('error'));
  });

  it('should unwrap the contained `ok` value and throw on `err` with `unwrap` and `unwrapErr`', () => {
    expectResultUnwrap(okVal).toBe<'value', never>(true);
    expect(okVal.unwrap()).toBe('value');
    expect(() => okVal.unwrapErr()).toThrow("Attempted to unwrapErr an 'ok' value: value");

    expectResultUnwrap(errVal).toBe<never, 'error'>(true);
    expect(() => errVal.unwrap()).toThrow('error');
    expect(errVal.unwrapErr()).toBe('error');

    expectResultUnwrap(okResVal).toBe<'value', unknown>(true);
    expect(okResVal.unwrap()).toBe('value');
    expect(() => okResVal.unwrapErr()).toThrow("Attempted to unwrapErr an 'ok' value: value");

    expectResultUnwrap(errResVal).toBe<'value', unknown>(true);
    expect(() => errResVal.unwrap()).toThrow('error');
    expect(errResVal.unwrapErr()).toStrictEqual(Error('error'));
  });

  it('should unwrap the contained value or return a default with `unwrapOr` and `unwrapOrElse`', () => {
    const defaultValue = 'default' as const;
    const mock = vi.fn();
    const defaultFunction = () => {
      mock();
      return defaultValue;
    };

    const okOr = okVal.unwrapOr(defaultValue);
    const okOrElse = okVal.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(0);
    expectTypeOf(okOr).toEqualTypeOf<'value'>();
    expectTypeOf(okOrElse).toEqualTypeOf<'value'>();
    expect(okOr).toBe('value');
    expect(okOrElse).toBe('value');

    const errOr = errVal.unwrapOr(defaultValue);
    const errOrElse = errVal.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(1);
    expectTypeOf(errOr).toEqualTypeOf<'default'>();
    expectTypeOf(errOrElse).toEqualTypeOf<'default'>();
    expect(errOr).toBe('default');
    expect(errOrElse).toBe('default');

    const okResOr = okResVal.unwrapOr(defaultValue);
    const okResOrElse = okResVal.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(1);
    expectTypeOf(okResOr).toEqualTypeOf<'value' | 'default'>();
    expectTypeOf(okResOrElse).toEqualTypeOf<'value' | 'default'>();
    expect(okResOr).toBe('value');
    expect(okResOrElse).toBe('value');

    const errResOr = errResVal.unwrapOr(defaultValue);
    const errResOrElse = errResVal.unwrapOrElse(defaultFunction);
    expect(mock).toHaveBeenCalledTimes(2);
    expectTypeOf(errResOr).toEqualTypeOf<'value' | 'default'>();
    expectTypeOf(errResOrElse).toEqualTypeOf<'value' | 'default'>();
    expect(errResOr).toBe('default');
    expect(errResOrElse).toBe('default');
  });

  it('should convert to respective `Option` types using `ok` and `err`', () => {
    const okSome = okVal.ok();
    expectTypeOf(okSome).toEqualTypeOf<Some<'value'>>();
    expectTypeOf(okSome.isSome).toEqualTypeOf<true>();
    expect(okSome.isSome).toBe(true);
    expect(okSome.unwrap()).toBe('value');

    const okNone = okVal.err();
    expectTypeOf(okNone).toEqualTypeOf<None>();
    expectTypeOf(okNone.isSome).toEqualTypeOf<false>();
    expect(okNone.isNone).toBe(true);
    expect(okNone.unwrap).toThrow();

    const errSome = errVal.err();
    expectTypeOf(errSome).toEqualTypeOf<Some<'error'>>();
    expectTypeOf(errSome.isSome).toEqualTypeOf<true>();
    expect(errSome.isSome).toBe(true);
    expect(errSome.unwrap()).toBe('error');

    const errNone = errVal.ok();
    expectTypeOf(errNone).toEqualTypeOf<None>();
    expectTypeOf(errNone.isSome).toEqualTypeOf<false>();
    expect(errNone.isNone).toBe(true);
    expect(errNone.unwrap).toThrow();

    const okResSome = okResVal.ok();
    expectTypeOf(okResSome).toEqualTypeOf<Option<'value'>>();
    expectTypeOf(okResSome.isSome).toEqualTypeOf<boolean>();
    expect(okResSome.isSome).toBe(true);
    expect(okResSome.unwrap()).toBe('value');

    const okResNone = okResVal.err();
    expectTypeOf(okResNone).toEqualTypeOf<Option<unknown>>();
    expectTypeOf(okResNone.isSome).toEqualTypeOf<boolean>();
    expect(okResNone.isNone).toBe(true);
    expect(okResNone.unwrap).toThrow();

    const errResSome = errResVal.err();
    expectTypeOf(errResSome).toEqualTypeOf<Option<unknown>>();
    expectTypeOf(errResSome.isSome).toEqualTypeOf<boolean>();
    expect(errResSome.isSome).toBe(true);
    expect(errResSome.unwrap()).toStrictEqual(Error('error'));

    const errResNone = errResVal.ok();
    expectTypeOf(errResNone).toEqualTypeOf<Option<'value'>>();
    expectTypeOf(errResNone.isSome).toEqualTypeOf<boolean>();
    expect(errResNone.isNone).toBe(true);
    expect(errResNone.unwrap).toThrow();
  });

  it('should transpose a `Result` of an `Option` into an `Option` of a `Result`', () => {
    const okNone = ok(none).transpose();
    expectTypeOf(okNone).toEqualTypeOf<None>();
    expect(okNone.isNone).toBe(true);

    const okSome = ok(some('value' as const)).transpose();
    expectTypeOf(okSome).toEqualTypeOf<Some<Ok<'value'>>>();
    expect(okSome.isSome).toBe(true);
    expect(okSome.unwrap().isOk).toBe(true);
    expect(okSome.unwrap().unwrap()).toBe('value');

    const okTransposed = okVal.transpose();
    expectTypeOf(okTransposed).toEqualTypeOf<Some<Ok<'value'>>>();
    expect(okTransposed.isSome).toBe(true);
    expect(okTransposed.unwrap().isOk).toBe(true);
    expect(okTransposed.unwrap().unwrap()).toBe('value');

    const errNone = err(none).transpose();
    expectTypeOf(errNone).toEqualTypeOf<Some<Err<None>>>();
    expect(errNone.isSome).toBe(true);
    expect(errNone.unwrap().isErr).toBe(true);
    expect(errNone.unwrap().unwrapErr().isNone).toBe(true);

    const errSome = err(some('value' as const)).transpose();
    expectTypeOf(errSome).toEqualTypeOf<Some<Err<Some<'value'>>>>();
    expect(errSome.isSome).toBe(true);
    expect(errSome.unwrap().isErr).toBe(true);
    expect(errSome.unwrap().unwrapErr().isSome).toBe(true);
    expect(errSome.unwrap().unwrapErr().unwrap()).toBe('value');

    const errTransposed = errVal.transpose();
    expectTypeOf(errTransposed).toEqualTypeOf<Some<Err<'error'>>>();
    expect(errTransposed.isSome).toBe(true);
    expect(errTransposed.unwrap().isErr).toBe(true);
    expect(errTransposed.unwrap().unwrapErr()).toBe('error');
  });

  it('should flatten a `Result` for at most one level', () => {
    const singleOk = ok('value' as const).flatten();
    expectResultUnwrap(singleOk).toBe<'value', never>(true);
    expect(singleOk.unwrap()).toBe('value');

    const singleErr = err('error' as const).flatten();
    expectResultUnwrap(singleErr).toBe<never, 'error'>(true);
    expect(singleErr.unwrapErr()).toBe('error');

    const singleOkRes = okResVal.flatten();
    expectResultUnwrap(singleOkRes).toBe<'value', unknown>(true);
    expect(singleOkRes.unwrap()).toBe('value');

    const singleErrRes = errResVal.flatten();
    expectResultUnwrap(singleErrRes).toBe<'value', unknown>(true);
    expect(singleErrRes.unwrapErr()).toStrictEqual(Error('error'));

    const okOk = ok(ok('value' as const)).flatten();
    expectResultUnwrap(okOk).toBe<'value', never>(true);
    expect(okOk.unwrap()).toBe('value');

    const okErr = ok(err('error' as const)).flatten();
    expectResultUnwrap(okErr).toBe<never, 'error'>(true);
    expect(okErr.unwrapErr()).toBe('error');

    const errOk = err(ok('value' as const)).flatten();
    expectResultUnwrap(errOk).toBe<never, Ok<'value'>>(true);
    expect(errOk.unwrapErr().unwrap()).toBe('value');

    const errErr = err(err('error' as const)).flatten();
    expectResultUnwrap(errErr).toBe<never, Err<'error'>>(true);
    expect(errErr.unwrapErr().unwrapErr()).toBe('error');

    const okOkOk = ok(ok(ok('value' as const))).flatten();
    expectResultUnwrap(okOkOk).toBe<Ok<'value'>, never>(true);
    expect(okOkOk.unwrap().unwrap()).toBe('value');

    const okOkRes = (ok(ok('value')) as Result<Result<'value', 'error2'>, 'error1'>).flatten();
    expectResultUnwrap(okOkRes).toBe<'value', 'error1' | 'error2'>(true);
    expect(okOkRes.unwrap()).toBe('value');
  });

  it('should map a function `ok` and `err` values using `map` and `mapErr`', async () => {
    const mapFn = (v: string) => v === 'value';
    const mapErrFn = (v: unknown) =>
      v === 'error' ? ('new-error' as const) : ('old-error' as const);

    const okMapped = okVal.map(mapFn);
    expectResultUnwrap(okMapped).toBe<boolean, never>(true);
    expect(okMapped.unwrap()).toBe(true);
    const okMappedErr = okVal.mapErr(mapErrFn);
    expectResultUnwrap(okMappedErr).toBe<'value', never>(true);
    expect(okMappedErr.unwrap()).toBe('value');

    const errMapped = errVal.map(mapFn);
    expectResultUnwrap(errMapped).toBe<never, 'error'>(true);
    expect(errMapped.unwrapErr()).toBe('error');
    const errMappedErr = errVal.mapErr(mapErrFn);
    expectResultUnwrap(errMappedErr).toBe<never, 'new-error' | 'old-error'>(true);
    expect(errMappedErr.unwrapErr()).toBe('new-error');

    const okResultMapped = okResVal.map(mapFn);
    expectResultUnwrap(okResultMapped).toBe<boolean, unknown>(true);
    expect(okResultMapped.unwrap()).toBe(true);
    const okResultMappedErr = okResVal.mapErr(mapErrFn);
    expectResultUnwrap(okResultMappedErr).toBe<'value', 'new-error' | 'old-error'>(true);
    expect(okResultMappedErr.unwrap()).toBe('value');

    const errResultMapped = errResVal.map(mapFn);
    expectResultUnwrap(errResultMapped).toBe<boolean, unknown>(true);
    expect(errResultMapped.unwrapErr()).toStrictEqual(Error('error'));
    const errResultMappedErr = errResVal.mapErr(mapErrFn);
    expectResultUnwrap(errResultMappedErr).toBe<'value', 'new-error' | 'old-error'>(true);
    expect(errResultMappedErr.unwrapErr()).toStrictEqual('old-error');

    // TODO proof of concept
    // const asyncOkMapped = okVal.map(async (v) => mapFn(v));
    // expectTypeOf(asyncOkMapped).toEqualTypeOf<AsyncOk<boolean>>();
    // const asyncOkMappedAwaited = await asyncOkMapped;
    // expectTypeOf(asyncOkMappedAwaited).toEqualTypeOf<Ok<boolean>>();
  });

  it('should map function or return default value with `mapOr` and `mapOrElse`', () => {
    const mapFn = (v: string) => (v === 'value' ? 1 : 2);
    const expectMappedType = (v: 0 | 1 | 2) => v;

    const okMapOr = okVal.mapOr(0, mapFn);
    const okMapOrElse = okVal.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(okMapOr);
    expectMappedType(okMapOrElse);
    expect(okMapOr).toBe(1);
    expect(okMapOrElse).toBe(1);

    const errMapOr = errVal.mapOr(0, mapFn);
    const errMapOrElse = errVal.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(errMapOr);
    expectMappedType(errMapOrElse);
    expect(errMapOr).toBe(0);
    expect(errMapOrElse).toBe(0);

    const okResMapOr = okResVal.mapOr(0, mapFn);
    const okResMapOrElse = okResVal.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(okResMapOr);
    expectMappedType(okResMapOrElse);
    expect(okResMapOr).toBe(1);
    expect(okResMapOrElse).toBe(1);

    const errResMapOr = errResVal.mapOr(0, mapFn);
    const errResMapOrElse = errResVal.mapOrElse(() => 0 as const, mapFn);
    expectMappedType(errResMapOr);
    expectMappedType(errResMapOrElse);
    expect(errResMapOr).toBe(0);
    expect(errResMapOrElse).toBe(0);
  });

  it('should apply the logical `and` operation between result values', () => {
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

  it('should apply the logical `or` operation between result values', () => {
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

  it('should facilitate `andThen` chaining for result transformations', () => {
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

  it('should facilitate `orElse` chaining for error handling in results', () => {
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

  it('should emulate Rust\'s "match" syntax', () => {
    const mockFn = vi.fn();

    const okMatch = okVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        expect(value).toBe('value');
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<never>();
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(1);
    expectTypeOf(okMatch).toEqualTypeOf<'value'>();
    expect(okMatch).toBe('value');

    const errMatch = errVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<never>();
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'error'>();
        expect(error).toBe('error');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(2);
    expectTypeOf(errMatch).toEqualTypeOf<'error'>();
    expect(errMatch).toBe('error');

    const okResMatch = okRes1.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value1'>();
        expect(value).toBe('value1');
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'error1'>();
        expect(error).toBe('error1');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(3);
    expectTypeOf(okResMatch).toEqualTypeOf<'value1' | 'error1'>();
    expect(okResMatch).toBe('value1');

    const errResMatch = errRes1.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value1'>();
        expect(value).toBe('value1');
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'error1'>();
        expect(error).toBe('error1');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(4);
    expectTypeOf(errResMatch).toEqualTypeOf<'value1' | 'error1'>();
    expect(errResMatch).toBe('error1');
  });
});
