import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { asyncResult, err, ok, result } from '../src';

function throwSync(): boolean {
  throw new Error('This is an error');
}

function noThrowSync(): boolean {
  return true;
}

async function throwAsync(): Promise<boolean> {
  throw new Error('This is an async error');
}

async function noThrowAsync(): Promise<boolean> {
  return true;
}

describe('Result', () => {
  it('Is able to create type-safe `ok` and `err` values', () => {
    const okValue = ok('value');
    const errValue = err('error' as const);
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
    expectTypeOf<ReturnType<typeof unknownResult.map>>()
      .toHaveProperty('isOk')
      .toEqualTypeOf<boolean>();

    if (unknownResult.isOk) {
      expectTypeOf(unknownResult.map)
        .returns.toHaveProperty('isOk')
        .toEqualTypeOf<true>();
    } else {
      expectTypeOf(unknownResult.map)
        .returns.toHaveProperty('isOk')
        .toEqualTypeOf<false>();
    }
  });

  it('Allows to unwrap the value in the `Result` monad if present', async () => {
    const okUnwrap = ok(42).unwrap;
    expectTypeOf(okUnwrap).returns.toEqualTypeOf<number>();
    expect(okUnwrap()).toEqual(42);

    const errUnwrap = err('error').unwrap;
    expectTypeOf(errUnwrap).returns.toEqualTypeOf<never>();
    expect(errUnwrap).toThrow('error');

    const syncOkResultUnwrap = result(noThrowSync).unwrap;
    expectTypeOf<
      ReturnType<typeof syncOkResultUnwrap>
    >().toEqualTypeOf<boolean>();
    expect(syncOkResultUnwrap()).toEqual(true);

    const syncErrResultUnwrap = result(throwSync).unwrap;
    expectTypeOf<
      ReturnType<typeof syncErrResultUnwrap>
    >().toEqualTypeOf<boolean>();
    expect(syncErrResultUnwrap).toThrow('This is an error');

    const asyncOkResultUnwrap = result(noThrowAsync).unwrap;
    expectTypeOf<ReturnType<typeof asyncOkResultUnwrap>>().toEqualTypeOf<
      Promise<boolean>
    >();
    expect(await asyncOkResultUnwrap()).toBe(true);

    const asyncErrResultUnwrap = result(throwAsync).unwrap;
    expectTypeOf<ReturnType<typeof asyncErrResultUnwrap>>().toEqualTypeOf<
      Promise<boolean>
    >();
    expect(asyncErrResultUnwrap).rejects.toThrow('This is an async error');
  });

  it('Allows to unwrap the error in the `Result` monad if present', async () => {
    const okUnwrapErr = ok(42).unwrapErr;
    expectTypeOf(okUnwrapErr).returns.toEqualTypeOf<never>();
    expect(okUnwrapErr).toThrowErrorMatchingInlineSnapshot('42');

    const errUnwrapErr = err('error' as const).unwrapErr;
    expectTypeOf(errUnwrapErr).returns.toEqualTypeOf<'error'>();
    expect(errUnwrapErr()).toBe('error');

    const syncOkResultUnwrapErr = result(noThrowSync).unwrapErr;
    expectTypeOf<
      ReturnType<typeof syncOkResultUnwrapErr>
    >().toEqualTypeOf<unknown>();
    expect(syncOkResultUnwrapErr).toThrowErrorMatchingInlineSnapshot('true');

    const syncErrResultUnwrapErr = result(throwSync).unwrapErr;
    expectTypeOf<
      ReturnType<typeof syncErrResultUnwrapErr>
    >().toEqualTypeOf<unknown>();
    expect(syncErrResultUnwrapErr()).toStrictEqual(Error('This is an error'));

    const asyncOkResultUnwrapErr = (await asyncResult(noThrowAsync)).unwrapErr;
    expectTypeOf<
      ReturnType<typeof asyncOkResultUnwrapErr>
    >().toEqualTypeOf<unknown>();
    expect(asyncOkResultUnwrapErr).toThrowErrorMatchingInlineSnapshot('true');

    const asyncErrResultUnwrapErr = (await asyncResult(throwAsync)).unwrapErr;
    expectTypeOf<
      ReturnType<typeof asyncErrResultUnwrapErr>
    >().toEqualTypeOf<unknown>();
    expect(asyncErrResultUnwrapErr()).toStrictEqual(
      Error('This is an async error'),
    );
  });

  it('Allows to inspect the value in the result', () => {
    const mockFn = vi.fn();

    ok(42).inspect((v) => {
      expectTypeOf(v).toEqualTypeOf<number>();
      expect(v).toBe(42);
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    ok(42).inspectErr((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    err('error' as const).inspect((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(1);

    err('error' as const).inspectErr((v) => {
      expectTypeOf(v).toEqualTypeOf<'error'>();
      expect(v).toBe('error');
      mockFn();
    });
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('Maps a result by applying a function to a contained ok value, leaving an err value untouched', () => {
    const okValue = ok(42).map((v) => {
      expectTypeOf(v).toEqualTypeOf<number>();
      return (v * 2).toString();
    });
    const errValue = err('error').map((v) => {
      expectTypeOf(v).toEqualTypeOf<never>();
      return (v * 2).toString();
    });
    const okResultValue = result(noThrowSync).map((v) => {
      expectTypeOf(v).toEqualTypeOf<boolean>();
      return !v;
    });
    const errResultValue = result(throwSync).map((v) => {
      expectTypeOf(v).toEqualTypeOf<boolean>();
      return !v;
    });

    expectTypeOf(okValue.isOk).toEqualTypeOf<true>();
    expect(okValue.isOk).toBe(true);
    expectTypeOf(okValue.isErr).toEqualTypeOf<false>();
    expect(okValue.isErr).toBe(false);
    expectTypeOf(okValue.unwrap).returns.toEqualTypeOf<string>();
    expect(okValue.unwrap()).toBe('84');

    expectTypeOf(errValue.isOk).toEqualTypeOf<false>();
    expect(errValue.isOk).toBe(false);
    expectTypeOf(errValue.isErr).toEqualTypeOf<true>();
    expect(errValue.isErr).toBe(true);
    expectTypeOf(errValue.unwrap).returns.toEqualTypeOf<never>();
    expect(errValue.unwrapErr()).toBe('error');

    expectTypeOf(okResultValue.isOk).toEqualTypeOf<boolean>();
    expect(okResultValue.isOk).toBe(true);
    expectTypeOf(okResultValue.isErr).toEqualTypeOf<boolean>();
    expect(okResultValue.isErr).toBe(false);
    expectTypeOf<
      ReturnType<typeof okResultValue.unwrap>
    >().toEqualTypeOf<boolean>();
    expect(okResultValue.unwrap()).toBe(false);

    expectTypeOf(errResultValue.isOk).toEqualTypeOf<boolean>();
    expect(errResultValue.isOk).toBe(false);
    expectTypeOf(errResultValue.isErr).toEqualTypeOf<boolean>();
    expect(errResultValue.isErr).toBe(true);
    expectTypeOf<
      ReturnType<typeof errResultValue.unwrap>
    >().toEqualTypeOf<boolean>();
    expect(errResultValue.unwrapErr()).toStrictEqual(Error('This is an error'));
  });
});
