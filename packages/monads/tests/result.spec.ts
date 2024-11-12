import { describe, expect, expectTypeOf, it, test, vi } from 'vitest';
import {
  type AnyAsyncResult,
  type AnySyncResult,
  type AsyncResult,
  type Result,
  asyncErr,
  asyncOk,
  asyncResultFromThrowable,
  err,
  ok,
  resultFromThrowable,
} from '../src';
import type { And, Equal, Ternary } from './util';

function returns(): 'value' {
  return 'value';
}

function throws(): 'value' {
  throw new Error('error');
}

async function returnsAsync(): Promise<'value'> {
  return await Promise.resolve('value');
}

async function throwsAsync(): Promise<'value'> {
  throw await Promise.resolve(new Error('error'));
}

const okVal = ok('value');
const asyncOkVal = asyncOk('value');
const errVal = err('error');
const asyncErrVal = asyncErr('error');

const earlyOk = ok('early');
const earlyErr = err('early');
const asyncEarlyOk = asyncOk('early');
const asyncEarlyErr = asyncErr('early');

const lateOk = ok('late');
const lateErr = err('late');
const asyncLateOk = asyncOk('late');
const asyncLateErr = asyncErr('late');

const okResVal = resultFromThrowable(returns);
const errResVal = resultFromThrowable(throws);
const asyncOkResVal = asyncResultFromThrowable(returnsAsync);
const asyncErrResVal = asyncResultFromThrowable(throwsAsync);

const okRes1 = ok('v1') as Result<'v1', 'e1'>;
const okRes2 = ok('v2') as Result<'v2', 'e2'>;
const errRes1 = err('e1') as Result<'v1', 'e1'>;
const errRes2 = err('e2') as Result<'v2', 'e2'>;
const asyncOkRes1 = asyncOk('v1') as AsyncResult<Result<'v1', 'e1'>>;
const asyncOkRes2 = asyncOk('v2') as AsyncResult<Result<'v2', 'e2'>>;
const asyncErrRes1 = asyncErr('e1') as AsyncResult<Result<'v1', 'e1'>>;
const asyncErrRes2 = asyncErr('e2') as AsyncResult<Result<'v2', 'e2'>>;

// Predicates
const pTrue = () => true as const;
const pFalse = () => false as const;
const pAsyncTrue = async () => true as const;
const pAsyncFalse = async () => false as const;

function expectUnwrap<TResult extends AnySyncResult>(result: TResult) {
  return {
    toBe: <TUnwrap, TUnwrapErr>(
      isOk: Ternary<
        And<
          Equal<ReturnType<TResult['unwrap']>, TUnwrap>,
          Equal<ReturnType<TResult['unwrapErr']>, TUnwrapErr>
        >,
        boolean,
        never
      >,
      unwrappedValue: TUnwrap | TUnwrapErr,
    ) => {
      if (isOk) expect(result.unwrap()).toStrictEqual(unwrappedValue);
      else expect(result.unwrapErr()).toStrictEqual(unwrappedValue);
    },
  };
}

function expectAsyncUnwrap<TResult extends AnyAsyncResult>(result: TResult) {
  return {
    toBe: async <TUnwrap, TUnwrapErr>(
      isOk: Ternary<
        And<
          Equal<ReturnType<TResult['unwrap']>, TUnwrap>,
          Equal<ReturnType<TResult['unwrapErr']>, TUnwrapErr>
        >,
        boolean,
        never
      >,
      unwrappedValue: Awaited<TUnwrap | TUnwrapErr>,
    ) => {
      if (isOk) await expect(result.unwrap()).resolves.toStrictEqual(unwrappedValue);
      else await expect(result.unwrapErr()).resolves.toStrictEqual(unwrappedValue);
    },
  };
}

describe('Result', () => {
  it('should type-narrow based on `isOk` and `isErr` checks', async () => {
    expectUnwrap(okResVal).toBe<'value', unknown>(true, 'value');
    expectTypeOf(okResVal).not.toHaveProperty('value');
    expectTypeOf(okResVal).not.toHaveProperty('error');

    if (okResVal.isOk) {
      expectUnwrap(okResVal).toBe<'value', never>(true, 'value');
      expectTypeOf(okResVal).toHaveProperty('value');
      expectTypeOf(okResVal).not.toHaveProperty('error');
    } else {
      expectUnwrap(okResVal).toBe<never, unknown>(true, 'value');
      expectTypeOf(okResVal).not.toHaveProperty('value');
      expectTypeOf(okResVal).toHaveProperty('error');
    }

    await expectAsyncUnwrap(asyncOkResVal).toBe<Promise<'value'>, Promise<unknown>>(true, 'value');
    if (await asyncOkResVal.isOk) {
      // TODO make this also work for AsyncResult
      // expectUnwrapAsync(asyncOkResVal).toBe<P<'value'>, P<never>>(true, 'value');
    } else {
      // expectUnwrapAsync(asyncOkResVal).toBe<P<never>, P<unknown>>(true, 'value');
    }
  });

  test('isOk', () => {
    expectTypeOf(okVal.isOk).toEqualTypeOf<true>();
    expect(okVal.isOk).toBe(true);

    expectTypeOf(errVal.isOk).toEqualTypeOf<false>();
    expect(errVal.isOk).toBe(false);

    expectTypeOf(okResVal.isOk).toEqualTypeOf<boolean>();
    expect(okResVal.isOk).toBe(true);

    expectTypeOf(errResVal.isOk).toEqualTypeOf<boolean>();
    expect(errResVal.isOk).toBe(false);

    expectTypeOf(asyncOkVal.isOk).toEqualTypeOf<Promise<true>>();
    expect(asyncOkVal.isOk).resolves.toBe(true);

    expectTypeOf(asyncErrVal.isOk).toEqualTypeOf<Promise<false>>();
    expect(asyncErrVal.isOk).resolves.toBe(false);

    expectTypeOf(asyncOkResVal.isOk).toEqualTypeOf<Promise<boolean>>();
    expect(asyncOkResVal.isOk).resolves.toBe(true);

    expectTypeOf(asyncErrResVal.isOk).toEqualTypeOf<Promise<boolean>>();
    expect(asyncErrResVal.isOk).resolves.toBe(false);
  });

  test('isErr', () => {
    expectTypeOf(okVal.isErr).toEqualTypeOf<false>();
    expect(okVal.isErr).toBe(false);

    expectTypeOf(errVal.isErr).toEqualTypeOf<true>();
    expect(errVal.isErr).toBe(true);

    expectTypeOf(okResVal.isErr).toEqualTypeOf<boolean>();
    expect(okResVal.isErr).toBe(false);

    expectTypeOf(errResVal.isErr).toEqualTypeOf<boolean>();
    expect(errResVal.isErr).toBe(true);

    expectTypeOf(asyncOkVal.isErr).toEqualTypeOf<Promise<false>>();
    expect(asyncOkVal.isErr).resolves.toBe(false);

    expectTypeOf(asyncErrVal.isErr).toEqualTypeOf<Promise<true>>();
    expect(asyncErrVal.isErr).resolves.toBe(true);

    expectTypeOf(asyncOkResVal.isErr).toEqualTypeOf<Promise<boolean>>();
    expect(asyncOkResVal.isErr).resolves.toBe(false);

    expectTypeOf(asyncErrResVal.isErr).toEqualTypeOf<Promise<boolean>>();
    expect(asyncErrResVal.isErr).resolves.toBe(true);
  });

  test('isOkAnd', async () => {
    expectTypeOf(okVal.isOkAnd(pTrue)).toEqualTypeOf<true>();
    expect(okVal.isOkAnd(pTrue)).toBe(true);
    expectTypeOf(okVal.isOkAnd(pFalse)).toEqualTypeOf<false>();
    expect(okVal.isOkAnd(pFalse)).toBe(false);
    expectTypeOf(okVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<Promise<true>>();
    await expect(okVal.isOkAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(okVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(okVal.isOkAnd(pAsyncFalse)).resolves.toBe(false);

    expectTypeOf(errVal.isOkAnd(pTrue)).toEqualTypeOf<false>();
    expect(errVal.isOkAnd(pTrue)).toBe(false);
    expectTypeOf(errVal.isOkAnd(pFalse)).toEqualTypeOf<false>();
    expect(errVal.isOkAnd(pFalse)).toBe(false);
    expectTypeOf(errVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<false>();
    expect(errVal.isOkAnd(pAsyncTrue)).toBe(false);
    expectTypeOf(errVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<false>();
    expect(errVal.isOkAnd(pAsyncFalse)).toBe(false);

    expectTypeOf(okResVal.isOkAnd(pTrue)).toEqualTypeOf<boolean>();
    expect(okResVal.isOkAnd(pTrue)).toBe(true);
    expectTypeOf(okResVal.isOkAnd(pFalse)).toEqualTypeOf<false>();
    expect(okResVal.isOkAnd(pFalse)).toBe(false);
    expectTypeOf(okResVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<false | Promise<true>>();
    await expect(okResVal.isOkAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(okResVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<false | Promise<false>>();
    await expect(okResVal.isOkAnd(pAsyncFalse)).resolves.toBe(false);

    expectTypeOf(errResVal.isOkAnd(pTrue)).toEqualTypeOf<boolean>();
    expect(errResVal.isOkAnd(pTrue)).toBe(false);
    expectTypeOf(errResVal.isOkAnd(pFalse)).toEqualTypeOf<false>();
    expect(errResVal.isOkAnd(pFalse)).toBe(false);
    expectTypeOf(errResVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<false | Promise<true>>();
    expect(errResVal.isOkAnd(pAsyncTrue)).toBe(false);
    expectTypeOf(errResVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<false | Promise<false>>();
    expect(errResVal.isOkAnd(pAsyncFalse)).toBe(false);

    expectTypeOf(asyncOkVal.isOkAnd(pTrue)).toEqualTypeOf<Promise<true>>();
    await expect(asyncOkVal.isOkAnd(pTrue)).resolves.toBe(true);
    expectTypeOf(asyncOkVal.isOkAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkVal.isOkAnd(pFalse)).resolves.toBe(false);
    expectTypeOf(asyncOkVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<Promise<true>>();
    await expect(asyncOkVal.isOkAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(asyncOkVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkVal.isOkAnd(pAsyncFalse)).resolves.toBe(false);

    expectTypeOf(asyncErrVal.isOkAnd(pTrue)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrVal.isOkAnd(pTrue)).resolves.toBe(false);
    expectTypeOf(asyncErrVal.isOkAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrVal.isOkAnd(pFalse)).resolves.toBe(false);
    expectTypeOf(asyncErrVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrVal.isOkAnd(pAsyncTrue)).resolves.toBe(false);
    expectTypeOf(asyncErrVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrVal.isOkAnd(pAsyncFalse)).resolves.toBe(false);

    expectTypeOf(asyncOkResVal.isOkAnd(pTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncOkResVal.isOkAnd(pTrue)).resolves.toBe(true);
    expectTypeOf(asyncOkResVal.isOkAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkResVal.isOkAnd(pFalse)).resolves.toBe(false);
    expectTypeOf(asyncOkResVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncOkResVal.isOkAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(asyncOkResVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkResVal.isOkAnd(pAsyncFalse)).resolves.toBe(false);

    expectTypeOf(asyncErrResVal.isOkAnd(pAsyncTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncErrResVal.isOkAnd(pAsyncTrue)).resolves.toBe(false);
    expectTypeOf(asyncErrResVal.isOkAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrResVal.isOkAnd(pAsyncFalse)).resolves.toBe(false);
    expectTypeOf(asyncErrResVal.isOkAnd(pTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncErrResVal.isOkAnd(pTrue)).resolves.toBe(false);
    expectTypeOf(asyncErrResVal.isOkAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrResVal.isOkAnd(pFalse)).resolves.toBe(false);
  });

  test('isErrAnd', async () => {
    expectTypeOf(okVal.isErrAnd(pTrue)).toEqualTypeOf<false>();
    expect(okVal.isErrAnd(pTrue)).toBe(false);
    expectTypeOf(okVal.isErrAnd(pFalse)).toEqualTypeOf<false>();
    expect(okVal.isErrAnd(pFalse)).toBe(false);
    expectTypeOf(okVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<false>();
    expect(okVal.isErrAnd(pAsyncTrue)).toBe(false);
    expectTypeOf(okVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<false>();
    expect(okVal.isErrAnd(pAsyncFalse)).toBe(false);

    expectTypeOf(errVal.isErrAnd(pTrue)).toEqualTypeOf<true>();
    expect(errVal.isErrAnd(pTrue)).toBe(true);
    expectTypeOf(errVal.isErrAnd(pFalse)).toEqualTypeOf<false>();
    expect(errVal.isErrAnd(pFalse)).toBe(false);
    expectTypeOf(errVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<Promise<true>>();
    await expect(errVal.isErrAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(errVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(errVal.isErrAnd(pAsyncFalse)).resolves.toBe(false);

    expectTypeOf(okResVal.isErrAnd(pTrue)).toEqualTypeOf<boolean>();
    expect(okResVal.isErrAnd(pTrue)).toBe(false);
    expectTypeOf(okResVal.isErrAnd(pFalse)).toEqualTypeOf<false>();
    expect(okResVal.isErrAnd(pFalse)).toBe(false);
    expectTypeOf(okResVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<false | Promise<true>>();
    expect(okResVal.isErrAnd(pAsyncTrue)).toBe(false);
    expectTypeOf(okResVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<false | Promise<false>>();
    expect(okResVal.isErrAnd(pAsyncFalse)).toBe(false);

    expectTypeOf(errResVal.isErrAnd(pTrue)).toEqualTypeOf<boolean>();
    expect(errResVal.isErrAnd(pTrue)).toBe(true);
    expectTypeOf(errResVal.isErrAnd(pFalse)).toEqualTypeOf<false>();
    expect(errResVal.isErrAnd(pFalse)).toBe(false);
    expectTypeOf(errResVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<false | Promise<true>>();
    await expect(errResVal.isErrAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(errResVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<false | Promise<false>>();
    await expect(errResVal.isErrAnd(pAsyncFalse)).resolves.toBe(false);

    expectTypeOf(asyncOkVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkVal.isErrAnd(pAsyncTrue)).resolves.toBe(false);
    expectTypeOf(asyncOkVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkVal.isErrAnd(pAsyncFalse)).resolves.toBe(false);
    expectTypeOf(asyncOkVal.isErrAnd(pTrue)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkVal.isErrAnd(pTrue)).resolves.toBe(false);
    expectTypeOf(asyncOkVal.isErrAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkVal.isErrAnd(pFalse)).resolves.toBe(false);

    expectTypeOf(asyncErrVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<Promise<true>>();
    await expect(asyncErrVal.isErrAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(asyncErrVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrVal.isErrAnd(pAsyncFalse)).resolves.toBe(false);
    expectTypeOf(asyncErrVal.isErrAnd(pTrue)).toEqualTypeOf<Promise<true>>();
    await expect(asyncErrVal.isErrAnd(pTrue)).resolves.toBe(true);
    expectTypeOf(asyncErrVal.isErrAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrVal.isErrAnd(pFalse)).resolves.toBe(false);

    expectTypeOf(asyncOkResVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncOkResVal.isErrAnd(pAsyncTrue)).resolves.toBe(false);
    expectTypeOf(asyncOkResVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkResVal.isErrAnd(pAsyncFalse)).resolves.toBe(false);
    expectTypeOf(asyncOkResVal.isErrAnd(pTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncOkResVal.isErrAnd(pTrue)).resolves.toBe(false);
    expectTypeOf(asyncOkResVal.isErrAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncOkResVal.isErrAnd(pFalse)).resolves.toBe(false);

    expectTypeOf(asyncErrResVal.isErrAnd(pAsyncTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncErrResVal.isErrAnd(pAsyncTrue)).resolves.toBe(true);
    expectTypeOf(asyncErrResVal.isErrAnd(pAsyncFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrResVal.isErrAnd(pAsyncFalse)).resolves.toBe(false);
    expectTypeOf(asyncErrResVal.isErrAnd(pTrue)).toEqualTypeOf<Promise<boolean>>();
    await expect(asyncErrResVal.isErrAnd(pTrue)).resolves.toBe(true);
    expectTypeOf(asyncErrResVal.isErrAnd(pFalse)).toEqualTypeOf<Promise<false>>();
    await expect(asyncErrResVal.isErrAnd(pFalse)).resolves.toBe(false);
  });

  test('inspect', async () => {
    const okValMock = vi.fn();
    const okValInspected = okVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      okValMock(value);
    });
    expectUnwrap(okValInspected).toBe<'value', never>(true, 'value');
    expect(okValMock).toHaveBeenCalledWith('value');

    const okValAsyncMock = vi.fn();
    const okValAsyncInspected = okVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(okValAsyncMock(value));
    });
    expectUnwrap(okValAsyncInspected).toBe<'value', never>(true, 'value');
    expect(okValAsyncMock).toHaveBeenCalledWith('value');

    const errValMock = vi.fn();
    const errValInspected = errVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      errValMock(value);
    });
    expectUnwrap(errValInspected).toBe<never, 'error'>(false, 'error');
    expect(errValMock).not.toHaveBeenCalled();

    const errValAsyncMock = vi.fn();
    const errValAsyncInspected = errVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(errValAsyncMock(value));
    });
    expectUnwrap(errValAsyncInspected).toBe<never, 'error'>(false, 'error');
    expect(errValAsyncMock).not.toHaveBeenCalled();

    const okResMock = vi.fn();
    const okResInspected = okResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      okResMock(value);
    });
    expectUnwrap(okResInspected).toBe<'value', unknown>(true, 'value');
    expect(okResMock).toHaveBeenCalledWith('value');

    const okResAsyncMock = vi.fn();
    const okResAsyncInspected = okResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(okResAsyncMock(value));
    });
    expectUnwrap(okResAsyncInspected).toBe<'value', unknown>(true, 'value');
    expect(okResAsyncMock).toHaveBeenCalledWith('value');

    const errResMock = vi.fn();
    const errResInspected = errResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      errResMock(value);
    });
    expectUnwrap(errResInspected).toBe<'value', unknown>(false, new Error('error'));
    expect(errResMock).not.toHaveBeenCalled();

    const errResAsyncMock = vi.fn();
    const errResAsyncInspected = errResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(errResAsyncMock(value));
    });
    expectUnwrap(errResAsyncInspected).toBe<'value', unknown>(false, new Error('error'));
    expect(errResAsyncMock).not.toHaveBeenCalled();

    const asyncOkValMock = vi.fn();
    const asyncOkValInspected = asyncOkVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      asyncOkValMock(value);
    });
    expect(asyncOkValMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkValInspected).toBe<Promise<'value'>, Promise<never>>(
      true,
      'value',
    );
    expect(asyncOkValMock).toHaveBeenCalledWith('value');

    const asyncOkValAsyncMock = vi.fn();
    const asyncOkValAsyncInspected = asyncOkVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(asyncOkValAsyncMock(value));
    });
    expect(asyncOkValAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkValAsyncInspected).toBe<Promise<'value'>, Promise<never>>(
      true,
      'value',
    );
    expect(asyncOkValAsyncMock).toHaveBeenCalledWith('value');

    const asyncErrValMock = vi.fn();
    const asyncErrValInspected = asyncErrVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      asyncErrValMock(value);
    });
    expect(asyncErrValMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrValInspected).toBe<Promise<never>, Promise<'error'>>(
      false,
      'error',
    );
    expect(asyncErrValMock).not.toHaveBeenCalled();

    const asyncErrValAsyncMock = vi.fn();
    const asyncErrValAsyncInspected = asyncErrVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(asyncErrValAsyncMock(value));
    });
    expect(asyncErrValAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrValAsyncInspected).toBe<Promise<never>, Promise<'error'>>(
      false,
      'error',
    );
    expect(asyncErrValAsyncMock).not.toHaveBeenCalled();

    const asyncOkResMock = vi.fn();
    const asyncOkResInspected = asyncOkResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      asyncOkResMock(value);
    });
    expect(asyncOkResMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkResInspected).toBe<Promise<'value'>, Promise<unknown>>(
      true,
      'value',
    );
    expect(asyncOkResMock).toHaveBeenCalledWith('value');

    const asyncOkResAsyncMock = vi.fn();
    const asyncOkResAsyncInspected = asyncOkResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(asyncOkResAsyncMock(value));
    });
    expect(asyncOkResAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkResAsyncInspected).toBe<Promise<'value'>, Promise<unknown>>(
      true,
      'value',
    );
    expect(asyncOkResAsyncMock).toHaveBeenCalledWith('value');

    const asyncErrResMock = vi.fn();
    const asyncErrResInspected = asyncErrResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      asyncErrResMock(value);
    });
    expect(asyncErrResMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrResInspected).toBe<Promise<'value'>, Promise<unknown>>(
      false,
      new Error('error'),
    );
    expect(asyncErrResMock).not.toHaveBeenCalled();

    const asyncErrResAsyncMock = vi.fn();
    const asyncErrResAsyncInspected = asyncErrResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(asyncErrResAsyncMock(value));
    });
    expect(asyncErrResAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrResAsyncInspected).toBe<Promise<'value'>, Promise<unknown>>(
      false,
      new Error('error'),
    );
    expect(asyncErrResAsyncMock).not.toHaveBeenCalled();
  });

  test('inspectErr', async () => {
    const okValMock = vi.fn();
    const okValInspected = okVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      okValMock(value);
    });
    expectUnwrap(okValInspected).toBe<'value', never>(true, 'value');
    expect(okValMock).not.toHaveBeenCalled();

    const okValAsyncMock = vi.fn();
    const okValAsyncInspected = okVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(okValAsyncMock(value));
    });
    expectUnwrap(okValAsyncInspected).toBe<'value', never>(true, 'value');
    expect(okValAsyncMock).not.toHaveBeenCalled();

    const errValMock = vi.fn();
    const errValInspected = errVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      errValMock(value);
    });
    expectUnwrap(errValInspected).toBe<never, 'error'>(false, 'error');
    expect(errValMock).toHaveBeenCalledWith('error');

    const errValAsyncMock = vi.fn();
    const errValAsyncInspected = errVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      await Promise.resolve(errValAsyncMock(value));
    });
    expectUnwrap(errValAsyncInspected).toBe<never, 'error'>(false, 'error');
    expect(errValAsyncMock).toHaveBeenCalledWith('error');

    const okResMock = vi.fn();
    const okResInspected = okResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      okResMock(value);
    });
    expectUnwrap(okResInspected).toBe<'value', unknown>(true, 'value');
    expect(okResMock).not.toHaveBeenCalled();

    const okResAsyncMock = vi.fn();
    const okResAsyncInspected = okResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(okResAsyncMock(value));
    });
    expectUnwrap(okResAsyncInspected).toBe<'value', unknown>(true, 'value');
    expect(okResAsyncMock).not.toHaveBeenCalled();

    const errResMock = vi.fn();
    const errResInspected = errResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      errResMock(value);
    });
    expectUnwrap(errResInspected).toBe<'value', unknown>(false, new Error('error'));
    expect(errResMock).toHaveBeenCalledWith(new Error('error'));

    const errResAsyncMock = vi.fn();
    const errResAsyncInspected = errResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(errResAsyncMock(value));
    });
    expectUnwrap(errResAsyncInspected).toBe<'value', unknown>(false, new Error('error'));
    expect(errResAsyncMock).toHaveBeenCalledWith(new Error('error'));

    const asyncOkValMock = vi.fn();
    const asyncOkValInspected = asyncOkVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      asyncOkValMock(value);
    });
    expect(asyncOkValMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkValInspected).toBe<Promise<'value'>, Promise<never>>(
      true,
      'value',
    );
    expect(asyncOkValMock).not.toHaveBeenCalled();

    const asyncOkValAsyncMock = vi.fn();
    const asyncOkValAsyncInspected = asyncOkVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(asyncOkValAsyncMock(value));
    });
    expect(asyncOkValAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkValAsyncInspected).toBe<Promise<'value'>, Promise<never>>(
      true,
      'value',
    );
    expect(asyncOkValAsyncMock).not.toHaveBeenCalled();

    const asyncErrValMock = vi.fn();
    const asyncErrValInspected = asyncErrVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      asyncErrValMock(value);
    });
    expect(asyncErrValMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrValInspected).toBe<Promise<never>, Promise<'error'>>(
      false,
      'error',
    );
    expect(asyncErrValMock).toHaveBeenCalledWith('error');

    const asyncErrValAsyncMock = vi.fn();
    const asyncErrValAsyncInspected = asyncErrVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      await Promise.resolve(asyncErrValAsyncMock(value));
    });
    expect(asyncErrValAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrValAsyncInspected).toBe<Promise<never>, Promise<'error'>>(
      false,
      'error',
    );
    expect(asyncErrValAsyncMock).toHaveBeenCalledWith('error');

    const asyncOkResMock = vi.fn();
    const asyncOkResInspected = asyncOkResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      asyncOkResMock(value);
    });
    expect(asyncOkResMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkResInspected).toBe<Promise<'value'>, Promise<unknown>>(
      true,
      'value',
    );
    expect(asyncOkResMock).not.toHaveBeenCalled();

    const asyncOkResAsyncMock = vi.fn();
    const asyncOkResAsyncInspected = asyncOkResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(asyncOkResAsyncMock(value));
    });
    expect(asyncOkResAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncOkResAsyncInspected).toBe<Promise<'value'>, Promise<unknown>>(
      true,
      'value',
    );
    expect(asyncOkResAsyncMock).not.toHaveBeenCalled();

    const asyncErrResMock = vi.fn();
    const asyncErrResInspected = asyncErrResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      asyncErrResMock(value);
    });
    expect(asyncErrResMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrResInspected).toBe<Promise<'value'>, Promise<unknown>>(
      false,
      new Error('error'),
    );
    expect(asyncErrResMock).toHaveBeenCalledWith(new Error('error'));

    const asyncErrResAsyncMock = vi.fn();
    const asyncErrResAsyncInspected = asyncErrResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(asyncErrResAsyncMock(value));
    });
    expect(asyncErrResAsyncMock).not.toHaveBeenCalled();
    await expectAsyncUnwrap(asyncErrResAsyncInspected).toBe<Promise<'value'>, Promise<unknown>>(
      false,
      new Error('error'),
    );
    expect(asyncErrResAsyncMock).toHaveBeenCalledWith(new Error('error'));
  });

  test('expect', async () => {
    const msg = 'Should be ok';

    const okExpect = okVal.expect(msg);
    expectTypeOf(okExpect).toEqualTypeOf<'value'>();
    expect(okExpect).toBe('value');

    const errExpect = () => errVal.expect(msg);
    expectTypeOf(errExpect).returns.toEqualTypeOf<never>();
    expect(errExpect).toThrow(msg);

    const okResExpect = okResVal.expect(msg);
    expectTypeOf(okResExpect).toEqualTypeOf<'value'>();
    expect(okResExpect).toBe('value');

    const errResExpect = () => errResVal.expect(msg);
    expectTypeOf(errResExpect).returns.toEqualTypeOf<'value'>();
    expect(errResExpect).toThrow(msg);

    const asyncOkExpect = asyncOkVal.expect(msg);
    expectTypeOf(asyncOkExpect).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkExpect).resolves.toBe('value');

    const asyncErrExpect = () => asyncErrVal.expect(msg);
    expectTypeOf(asyncErrExpect).returns.resolves.toEqualTypeOf<never>();
    await expect(asyncErrExpect).rejects.toThrow(msg);

    const asyncOkResExpect = asyncOkResVal.expect(msg);
    expectTypeOf(asyncOkResExpect).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkResExpect).resolves.toBe('value');

    const asyncErrResExpect = () => asyncErrResVal.expect(msg);
    expectTypeOf(asyncErrResExpect).returns.resolves.toEqualTypeOf<'value'>();
    await expect(asyncErrResExpect).rejects.toThrow(msg);
  });

  test('expectErr', async () => {
    const msg = 'Should be err';

    const okExpectErr = () => okVal.expectErr(msg);
    expectTypeOf(okExpectErr).returns.toEqualTypeOf<never>();
    expect(okExpectErr).toThrow(msg);

    const errExpectErr = errVal.expectErr(msg);
    expectTypeOf(errExpectErr).toEqualTypeOf<'error'>();
    expect(errExpectErr).toBe('error');

    const okResExpectErr = () => okResVal.expectErr(msg);
    expectTypeOf(okResExpectErr).returns.toEqualTypeOf<unknown>();
    expect(okResExpectErr).toThrow(msg);

    const errResExpectErr = errResVal.expectErr(msg);
    expectTypeOf(errResExpectErr).toEqualTypeOf<unknown>();
    expect(errResExpectErr).toStrictEqual(new Error('error'));

    const asyncOkExpectErr = () => asyncOkVal.expectErr(msg);
    expectTypeOf(asyncOkExpectErr).returns.resolves.toEqualTypeOf<never>();
    await expect(asyncOkExpectErr).rejects.toThrow(msg);

    const asyncErrExpectErr = asyncErrVal.expectErr(msg);
    expectTypeOf(asyncErrExpectErr).resolves.toEqualTypeOf<'error'>();
    await expect(asyncErrExpectErr).resolves.toBe('error');

    const asyncOkResExpectErr = () => asyncOkResVal.expectErr(msg);
    expectTypeOf(asyncOkResExpectErr).returns.resolves.toEqualTypeOf<unknown>();
    await expect(asyncOkResExpectErr).rejects.toThrow(msg);

    const asyncErrResExpectErr = asyncErrResVal.expectErr(msg);
    expectTypeOf(asyncErrResExpectErr).resolves.toEqualTypeOf<unknown>();
    await expect(asyncErrResExpectErr).resolves.toStrictEqual(new Error('error'));
  });

  test('unwrap', async () => {
    const okUnwrap = okVal.unwrap();
    expectTypeOf(okUnwrap).toEqualTypeOf<'value'>();
    expect(okUnwrap).toBe('value');

    const errUnwrap = () => errVal.unwrap();
    expectTypeOf(errUnwrap).returns.toEqualTypeOf<never>();
    expect(errUnwrap).toThrow();

    const okResUnwrap = okResVal.unwrap();
    expectTypeOf(okResUnwrap).toEqualTypeOf<'value'>();
    expect(okResUnwrap).toBe('value');

    const errResUnwrap = () => errResVal.unwrap();
    expectTypeOf(errResUnwrap).returns.toEqualTypeOf<'value'>();
    expect(errResUnwrap).toThrow();

    const asyncOkUnwrap = asyncOkVal.unwrap();
    expectTypeOf(asyncOkUnwrap).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkUnwrap).resolves.toBe('value');

    const asyncErrUnwrap = () => asyncErrVal.unwrap();
    expectTypeOf(asyncErrUnwrap).returns.resolves.toEqualTypeOf<never>();
    await expect(asyncErrUnwrap).rejects.toThrow();

    const asyncOkResUnwrap = asyncOkResVal.unwrap();
    expectTypeOf(asyncOkResUnwrap).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkResUnwrap).resolves.toBe('value');

    const asyncErrResUnwrap = () => asyncErrResVal.unwrap();
    expectTypeOf(asyncErrResUnwrap).returns.resolves.toEqualTypeOf<'value'>();
    await expect(asyncErrResUnwrap).rejects.toThrow();
  });

  test('unwrapErr', async () => {
    const okUnwrapErr = () => okVal.unwrapErr();
    expectTypeOf(okUnwrapErr).returns.toEqualTypeOf<never>();
    expect(okUnwrapErr).toThrow();

    const errUnwrapErr = errVal.unwrapErr();
    expectTypeOf(errUnwrapErr).toEqualTypeOf<'error'>();
    expect(errUnwrapErr).toBe('error');

    const okResUnwrapErr = () => okResVal.unwrapErr();
    expectTypeOf(okResUnwrapErr).returns.toEqualTypeOf<unknown>();
    expect(okResUnwrapErr).toThrow();

    const errResUnwrapErr = errResVal.unwrapErr();
    expectTypeOf(errResUnwrapErr).toEqualTypeOf<unknown>();
    expect(errResUnwrapErr).toStrictEqual(new Error('error'));

    const asyncOkUnwrapErr = () => asyncOkVal.unwrapErr();
    expectTypeOf(asyncOkUnwrapErr).returns.resolves.toEqualTypeOf<never>();
    await expect(asyncOkUnwrapErr).rejects.toThrow();

    const asyncErrUnwrapErr = asyncErrVal.unwrapErr();
    expectTypeOf(asyncErrUnwrapErr).resolves.toEqualTypeOf<'error'>();
    await expect(asyncErrUnwrapErr).resolves.toBe('error');

    const asyncOkResUnwrapErr = () => asyncOkResVal.unwrapErr();
    expectTypeOf(asyncOkResUnwrapErr).returns.resolves.toEqualTypeOf<unknown>();
    await expect(asyncOkResUnwrapErr).rejects.toThrow();

    const asyncErrResUnwrapErr = asyncErrResVal.unwrapErr();
    expectTypeOf(asyncErrResUnwrapErr).resolves.toEqualTypeOf<unknown>();
    await expect(asyncErrResUnwrapErr).resolves.toStrictEqual(new Error('error'));
  });

  test.todo('unwrapOr', async () => {});

  test.todo('unwrapOrElse', async () => {});

  test.todo('ok', async () => {});

  test.todo('err', async () => {});

  test.todo('transpose', async () => {});

  test.todo('flatten', async () => {});

  test.todo('map', async () => {});

  test.todo('mapErr', async () => {});

  test.todo('mapOr', async () => {});

  test.todo('mapOrElse', async () => {});

  test.todo('and', async () => {});

  test.todo('or', async () => {});

  test.todo('andThen', async () => {});

  test.todo('orElse', async () => {});

  test.todo('match', async () => {});

  test.todo('serialize', async () => {});

  test.todo('merge', async () => {});
});
