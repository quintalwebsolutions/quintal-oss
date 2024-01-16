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
const syncOkResultValue = result(noThrowSync);
const syncErrResultValue = result(throwSync);

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

  it('Allows to unwrap the result value', async () => {
    expectResultUnwrap(okValue).toBe<'value', never>(true);
    expect(okValue.unwrap()).toBe('value');
    expect(okValue.unwrapErr).toThrowErrorMatchingInlineSnapshot('"value"');

    expectResultUnwrap(errValue).toBe<never, 'error'>(true);
    expect(errValue.unwrap).toThrow('error');
    expect(errValue.unwrapErr()).toBe('error');

    expectResultUnwrap(syncOkResultValue).toBe<'value', unknown>(true);
    expect(syncOkResultValue.unwrap()).toEqual('value');
    expect(syncOkResultValue.unwrapErr).toThrowErrorMatchingInlineSnapshot('"value"');

    expectResultUnwrap(syncErrResultValue).toBe<'value', unknown>(true);
    expect(syncErrResultValue.unwrap).toThrow('error');
    expect(syncErrResultValue.unwrapErr()).toStrictEqual(Error('error'));

    const asyncOkResultValue = await asyncResult(noThrowAsync);
    expectResultUnwrap(asyncOkResultValue).toBe<'value', unknown>(true);
    expect(asyncOkResultValue.unwrap()).toBe('value');
    expect(asyncOkResultValue.unwrapErr).toThrowErrorMatchingInlineSnapshot('"value"');

    const asyncErrResultValue = await asyncResult(throwAsync);
    expectResultUnwrap(asyncErrResultValue).toBe<'value', unknown>(true);
    expect(asyncErrResultValue.unwrap).toThrow('error');
    expect(asyncErrResultValue.unwrapErr()).toStrictEqual(Error('error'));
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

  it('Provides a `map` operation', () => {
    const okMapped = okValue.map((v) => {
      expectTypeOf(v).toEqualTypeOf<'value'>();
      return v === 'value';
    });
    expectTypeOf(okMapped.isOk).toEqualTypeOf<true>();
    expect(okMapped.isOk).toBe(true);
    expectTypeOf(okMapped.isErr).toEqualTypeOf<false>();
    expect(okMapped.isErr).toBe(false);
    expectResultUnwrap(okMapped).toBe<boolean, never>(true);
    expect(okMapped.unwrap()).toBe(true);

    const errMapped = errValue.map((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      return v === 'value';
    });
    expectTypeOf(errMapped.isOk).toEqualTypeOf<false>();
    expect(errMapped.isOk).toBe(false);
    expectTypeOf(errMapped.isErr).toEqualTypeOf<true>();
    expect(errMapped.isErr).toBe(true);
    expectResultUnwrap(errMapped).toBe<never, 'error'>(true);
    expect(errMapped.unwrapErr()).toBe('error');

    const okResultMapped = syncOkResultValue.map((v) => {
      expectTypeOf(v).toEqualTypeOf<'value'>();
      return !v;
    });
    expectTypeOf(okResultMapped.isOk).toEqualTypeOf<boolean>();
    expect(okResultMapped.isOk).toBe(true);
    expectTypeOf(okResultMapped.isErr).toEqualTypeOf<boolean>();
    expect(okResultMapped.isErr).toBe(false);
    expectResultUnwrap(okResultMapped).toBe<boolean, unknown>(true);
    expect(okResultMapped.unwrap()).toBe(false);

    const errResultMapped = syncErrResultValue.map((v) => {
      expectTypeOf(v).toEqualTypeOf<'value'>();
      return !v;
    });
    expectTypeOf(errResultMapped.isOk).toEqualTypeOf<boolean>();
    expect(errResultMapped.isOk).toBe(false);
    expectTypeOf(errResultMapped.isErr).toEqualTypeOf<boolean>();
    expect(errResultMapped.isErr).toBe(true);
    expectResultUnwrap(errResultMapped).toBe<boolean, unknown>(true);
    expect(errResultMapped.unwrapErr()).toStrictEqual(Error('error'));
  });
});
