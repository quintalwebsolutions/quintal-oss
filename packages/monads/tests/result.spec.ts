import { describe, expect, expectTypeOf, it, test, vi } from 'vitest';
import {
  type AnyResult,
  type AsyncErr,
  type AsyncNone,
  type AsyncOk,
  type AsyncResult,
  type AsyncSome,
  type Err,
  type None,
  type Ok,
  type Option,
  type Result,
  type Some,
  asyncErr,
  asyncOk,
  asyncResultFromSerialized,
  asyncResultFromThrowable,
  err,
  isAnyAsyncResult,
  isAnyResult,
  isAnySyncResult,
  ok,
  resultFromResults,
  resultFromSerialized,
  resultFromThrowable,
} from '../src';
import type { Ternary } from '../src/util';
import type { And, Equal } from './util';

const error = new Error('error');

function returns(): 'value' {
  return 'value';
}

function throws(): 'value' {
  throw error;
}

async function returnsAsync(): Promise<'value'> {
  return await Promise.resolve('value');
}

async function throwsAsync(): Promise<'value'> {
  throw await Promise.resolve(error);
}

const okVal = ok('value');
const asyncOkVal = asyncOk('value');
const errVal = err('error');
const asyncErrVal = asyncErr('error');

const okResVal = resultFromThrowable(returns);
const errResVal = resultFromThrowable(throws);
const asyncOkResVal = asyncResultFromThrowable(returnsAsync);
const asyncErrResVal = asyncResultFromThrowable(throwsAsync);

const ok1 = ok('v1');
const ok2 = ok('v2');
const err1 = err('e1');
const err2 = err('e2');
const asyncOk1 = asyncOk('v1');
const asyncOk2 = asyncOk('v2');
const asyncErr1 = asyncErr('e1');
const asyncErr2 = asyncErr('e2');

const okRes1 = ok('v1') as Result<'v1', 'e1'>;
const okRes2 = ok('v2') as Result<'v2', 'e2'>;
const errRes1 = err('e1') as Result<'v1', 'e1'>;
const errRes2 = err('e2') as Result<'v2', 'e2'>;
const asyncOkRes1 = asyncOk('v1') as AsyncResult<Result<'v1', 'e1'>>;
const asyncOkRes2 = asyncOk('v2') as AsyncResult<Result<'v2', 'e2'>>;
const asyncErrRes1 = asyncErr('e1') as AsyncResult<Result<'v1', 'e1'>>;
const asyncErrRes2 = asyncErr('e2') as AsyncResult<Result<'v2', 'e2'>>;

const pTrue = () => true as const;
const pFalse = () => false as const;
const pAsyncTrue = async () => true as const;
const pAsyncFalse = async () => false as const;

const defaultValue = 'default' as const;
const asyncDefaultValue = Promise.resolve(defaultValue);
const defaultFn = () => defaultValue;
const asyncDefaultFn = () => asyncDefaultValue;

const mappedValue = 'mapped' as const;
const asyncMappedValue = Promise.resolve(mappedValue);
type Mapped = typeof mappedValue;

// expectUnwrap
function eu<TResult extends AnyResult>(result: TResult) {
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

// expectUnwrapAsync
function eua<TResult extends AnyResult>(result: TResult) {
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

type P<TValue> = Promise<TValue>;

describe('Result', () => {
  it('should type-narrow based on `isOk` and `isErr` checks', async () => {
    eu(okResVal).toBe<'value', unknown>(true, 'value');
    expectTypeOf(okResVal).not.toHaveProperty('value');
    expectTypeOf(okResVal).not.toHaveProperty('error');

    if (okResVal.isOk) {
      eu(okResVal).toBe<'value', never>(true, 'value');
      expectTypeOf(okResVal).toHaveProperty('value');
      expectTypeOf(okResVal).not.toHaveProperty('error');
    } else {
      eu(okResVal).toBe<never, unknown>(true, 'value');
      expectTypeOf(okResVal).not.toHaveProperty('value');
      expectTypeOf(okResVal).toHaveProperty('error');
    }

    await eua(asyncOkResVal).toBe<P<'value'>, P<unknown>>(true, 'value');
    if (await asyncOkResVal.isOk) {
      // TODO make this also work for AsyncResult
      // expectUnwrapAsync(asyncOkResVal).toBe<P<'value'>, P<never>>(true, 'value');
    } else {
      // expectUnwrapAsync(asyncOkResVal).toBe<P<never>, P<unknown>>(true, 'value');
    }
  });

  it('infers simple types in constructor functions', () => {
    expectTypeOf(ok('hello world')).toEqualTypeOf<Ok<'hello world'>>();
    expectTypeOf(ok(42)).toEqualTypeOf<Ok<42>>();
    expectTypeOf(ok(true)).toEqualTypeOf<Ok<true>>();
    expectTypeOf(ok(null)).toEqualTypeOf<Ok<null>>();
    expectTypeOf(ok(undefined)).toEqualTypeOf<Ok<undefined>>();
    expectTypeOf(ok({ hello: 'world' })).toEqualTypeOf<Ok<{ hello: string }>>();

    expectTypeOf(err('hello world')).toEqualTypeOf<Err<'hello world'>>();
    expectTypeOf(err(42)).toEqualTypeOf<Err<42>>();
    expectTypeOf(err(true)).toEqualTypeOf<Err<true>>();
    expectTypeOf(err(null)).toEqualTypeOf<Err<null>>();
    expectTypeOf(err(undefined)).toEqualTypeOf<Err<undefined>>();
    expectTypeOf(err({ hello: 'world' })).toEqualTypeOf<Err<{ hello: string }>>();

    expectTypeOf(asyncOk('hello world')).toEqualTypeOf<AsyncOk<'hello world'>>();
    expectTypeOf(asyncOk(42)).toEqualTypeOf<AsyncOk<42>>();
    expectTypeOf(asyncOk(true)).toEqualTypeOf<AsyncOk<true>>();
    expectTypeOf(asyncOk(null)).toEqualTypeOf<AsyncOk<null>>();
    expectTypeOf(asyncOk(undefined)).toEqualTypeOf<AsyncOk<undefined>>();
    expectTypeOf(asyncOk({ hello: 'world' })).toEqualTypeOf<AsyncOk<{ hello: string }>>();

    expectTypeOf(asyncErr('hello world')).toEqualTypeOf<AsyncErr<'hello world'>>();
    expectTypeOf(asyncErr(42)).toEqualTypeOf<AsyncErr<42>>();
    expectTypeOf(asyncErr(true)).toEqualTypeOf<AsyncErr<true>>();
    expectTypeOf(asyncErr(null)).toEqualTypeOf<AsyncErr<null>>();
    expectTypeOf(asyncErr(undefined)).toEqualTypeOf<AsyncErr<undefined>>();
    expectTypeOf(asyncErr({ hello: 'world' })).toEqualTypeOf<AsyncErr<{ hello: string }>>();
  });

  it('provides type guards for result instances', () => {
    expect(isAnyResult('anything else')).toBe(false);

    expect(isAnySyncResult(okVal)).toBe(true);
    expect(isAnySyncResult(errVal)).toBe(true);
    expect(isAnySyncResult(okResVal)).toBe(true);
    expect(isAnySyncResult(errResVal)).toBe(true);
    expect(isAnySyncResult(asyncOkVal)).toBe(false);
    expect(isAnySyncResult(asyncErrVal)).toBe(false);
    expect(isAnySyncResult(asyncOkResVal)).toBe(false);
    expect(isAnySyncResult(asyncErrResVal)).toBe(false);

    expect(isAnyAsyncResult(okVal)).toBe(false);
    expect(isAnyAsyncResult(errVal)).toBe(false);
    expect(isAnyAsyncResult(okResVal)).toBe(false);
    expect(isAnyAsyncResult(errResVal)).toBe(false);
    expect(isAnyAsyncResult(asyncOkVal)).toBe(true);
    expect(isAnyAsyncResult(asyncErrVal)).toBe(true);
    expect(isAnyAsyncResult(asyncOkResVal)).toBe(true);
    expect(isAnyAsyncResult(asyncErrResVal)).toBe(true);

    expect(isAnyResult(okVal)).toBe(true);
    expect(isAnyResult(errVal)).toBe(true);
    expect(isAnyResult(okResVal)).toBe(true);
    expect(isAnyResult(errResVal)).toBe(true);
    expect(isAnyResult(asyncOkVal)).toBe(true);
    expect(isAnyResult(asyncErrVal)).toBe(true);
    expect(isAnyResult(asyncOkResVal)).toBe(true);
    expect(isAnyResult(asyncErrResVal)).toBe(true);
  });

  it('merges multiple results into one', async () => {
    // biome-ignore lint/correctness/noConstantCondition: allow for test
    if (false) {
      // @ts-expect-error
      resultFromResults();
      // @ts-expect-error
      resultFromResults(okVal);
    }

    eu(resultFromResults(ok1, ok2, ok1)).toBe<['v1', 'v2', 'v1'], never>(true, ['v1', 'v2', 'v1']);
    await eua(resultFromResults(ok1, asyncOk2, ok1)).toBe<P<['v1', 'v2', 'v1']>, P<never>>(true, [
      'v1',
      'v2',
      'v1',
    ]);
    eu(resultFromResults(ok1, ok2, err1)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(ok1, err1, asyncErr2)).toBe<never, 'e1'>(false, 'e1');
    await eua(resultFromResults(ok1, asyncErr1, err2)).toBe<P<never>, P<'e1'>>(false, 'e1');

    eu(resultFromResults(ok1, ok2)).toBe<['v1', 'v2'], never>(true, ['v1', 'v2']);
    eu(resultFromResults(ok1, err2)).toBe<never, 'e2'>(false, 'e2');
    await eua(resultFromResults(ok1, asyncOk2)).toBe<P<['v1', 'v2']>, P<never>>(true, ['v1', 'v2']);
    await eua(resultFromResults(ok1, asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    eu(resultFromResults(ok1, okRes2)).toBe<['v1', 'v2'], 'e2'>(true, ['v1', 'v2']);
    eu(resultFromResults(ok1, errRes2)).toBe<['v1', 'v2'], 'e2'>(false, 'e2');
    await eua(resultFromResults(ok1, asyncOkRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e2'> | P<never>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(ok1, asyncErrRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e2'> | P<never>
    >(false, 'e2');

    eu(resultFromResults(err1, ok2)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(err1, err2)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(err1, asyncOk2)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(err1, asyncErr2)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(err1, okRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(err1, errRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(err1, asyncOkRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(resultFromResults(err1, asyncErrRes2)).toBe<never, 'e1'>(false, 'e1');

    eu(resultFromResults(okRes1, ok2)).toBe<['v1', 'v2'], 'e1'>(true, ['v1', 'v2']);
    eu(resultFromResults(okRes1, err2)).toBe<never, 'e1' | 'e2'>(false, 'e2');
    await eua(resultFromResults(okRes1, asyncOk2)).toBe<P<['v1', 'v2']> | never, 'e1' | P<never>>(
      true,
      ['v1', 'v2'],
    );
    await eua(resultFromResults(okRes1, asyncErr2)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e2');
    eu(resultFromResults(okRes1, okRes2)).toBe<['v1', 'v2'], 'e1' | 'e2'>(true, ['v1', 'v2']);
    eu(resultFromResults(okRes1, errRes2)).toBe<['v1', 'v2'], 'e1' | 'e2'>(false, 'e2');
    await eua(resultFromResults(okRes1, asyncOkRes2)).toBe<
      P<['v1', 'v2']> | never | P<never>,
      P<never> | 'e1' | P<'e2'>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(okRes1, asyncErrRes2)).toBe<
      P<['v1', 'v2']> | never | P<never>,
      P<never> | 'e1' | P<'e2'>
    >(false, 'e2');

    eu(resultFromResults(errRes1, ok2)).toBe<['v1', 'v2'], 'e1'>(false, 'e1');
    eu(resultFromResults(errRes1, err2)).toBe<never, 'e1' | 'e2'>(false, 'e1');
    eu(resultFromResults(errRes1, asyncOk2)).toBe<P<['v1', 'v2']> | never, 'e1' | P<never>>(
      false,
      'e1',
    );
    eu(resultFromResults(errRes1, asyncErr2)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e1');
    eu(resultFromResults(errRes1, okRes2)).toBe<['v1', 'v2'], 'e1' | 'e2'>(false, 'e1');
    eu(resultFromResults(errRes1, errRes2)).toBe<['v1', 'v2'], 'e1' | 'e2'>(false, 'e1');
    eu(resultFromResults(errRes1, asyncOkRes2)).toBe<
      P<['v1', 'v2']> | never | P<never>,
      'e1' | P<'e2'> | P<never>
    >(false, 'e1');
    eu(resultFromResults(errRes1, asyncErrRes2)).toBe<
      P<['v1', 'v2']> | never | P<never>,
      'e1' | P<'e2'> | P<never>
    >(false, 'e1');

    await eua(resultFromResults(asyncOk1, ok2)).toBe<P<['v1', 'v2']>, P<never>>(true, ['v1', 'v2']);
    await eua(resultFromResults(asyncOk1, err2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(resultFromResults(asyncOk1, asyncOk2)).toBe<P<['v1', 'v2']>, P<never>>(true, [
      'v1',
      'v2',
    ]);
    await eua(resultFromResults(asyncOk1, asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(resultFromResults(asyncOk1, okRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e2'> | P<never>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(asyncOk1, errRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e2'> | P<never>
    >(false, 'e2');
    await eua(resultFromResults(asyncOk1, asyncOkRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e2'> | P<never>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(asyncOk1, asyncErrRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e2'> | P<never>
    >(false, 'e2');

    await eua(resultFromResults(asyncErr1, ok2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(resultFromResults(asyncErr1, err2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(resultFromResults(asyncErr1, asyncOk2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(resultFromResults(asyncErr1, asyncErr2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(resultFromResults(asyncErr1, okRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(resultFromResults(asyncErr1, errRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(resultFromResults(asyncErr1, asyncOkRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(resultFromResults(asyncErr1, asyncErrRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');

    await eua(resultFromResults(asyncOkRes1, ok2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<never>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(asyncOkRes1, err2)).toBe<P<never>, P<'e1'> | P<'e2'>>(false, 'e2');
    await eua(resultFromResults(asyncOkRes1, asyncOk2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<never>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(asyncOkRes1, asyncErr2)).toBe<P<never>, P<'e1'> | P<'e2'>>(
      false,
      'e2',
    );
    await eua(resultFromResults(asyncOkRes1, okRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(asyncOkRes1, errRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(false, 'e2');
    await eua(resultFromResults(asyncOkRes1, asyncOkRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(true, ['v1', 'v2']);
    await eua(resultFromResults(asyncOkRes1, asyncErrRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(false, 'e2');

    await eua(resultFromResults(asyncErrRes1, ok2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<never>
    >(false, 'e1');
    await eua(resultFromResults(asyncErrRes1, err2)).toBe<P<never>, P<'e1'> | P<'e2'>>(false, 'e1');
    await eua(resultFromResults(asyncErrRes1, asyncOk2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<never>
    >(false, 'e1');
    await eua(resultFromResults(asyncErrRes1, asyncErr2)).toBe<P<never>, P<'e1'> | P<'e2'>>(
      false,
      'e1',
    );
    await eua(resultFromResults(asyncErrRes1, okRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(false, 'e1');
    await eua(resultFromResults(asyncErrRes1, errRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(false, 'e1');
    await eua(resultFromResults(asyncErrRes1, asyncOkRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(false, 'e1');
    await eua(resultFromResults(asyncErrRes1, asyncErrRes2)).toBe<
      P<['v1', 'v2']> | P<never>,
      P<'e1'> | P<'e2'> | P<never>
    >(false, 'e1');
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
    eu(okValInspected).toBe<'value', never>(true, 'value');
    expect(okValMock).toHaveBeenCalledWith('value');

    const okValAsyncMock = vi.fn();
    const okValAsyncInspected = okVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(okValAsyncMock(value));
    });
    eu(okValAsyncInspected).toBe<'value', never>(true, 'value');
    expect(okValAsyncMock).toHaveBeenCalledWith('value');

    const errValMock = vi.fn();
    const errValInspected = errVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      errValMock(value);
    });
    eu(errValInspected).toBe<never, 'error'>(false, 'error');
    expect(errValMock).not.toHaveBeenCalled();

    const errValAsyncMock = vi.fn();
    const errValAsyncInspected = errVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(errValAsyncMock(value));
    });
    eu(errValAsyncInspected).toBe<never, 'error'>(false, 'error');
    expect(errValAsyncMock).not.toHaveBeenCalled();

    const okResMock = vi.fn();
    const okResInspected = okResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      okResMock(value);
    });
    eu(okResInspected).toBe<'value', unknown>(true, 'value');
    expect(okResMock).toHaveBeenCalledWith('value');

    const okResAsyncMock = vi.fn();
    const okResAsyncInspected = okResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(okResAsyncMock(value));
    });
    eu(okResAsyncInspected).toBe<'value', unknown>(true, 'value');
    expect(okResAsyncMock).toHaveBeenCalledWith('value');

    const errResMock = vi.fn();
    const errResInspected = errResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      errResMock(value);
    });
    eu(errResInspected).toBe<'value', unknown>(false, error);
    expect(errResMock).not.toHaveBeenCalled();

    const errResAsyncMock = vi.fn();
    const errResAsyncInspected = errResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(errResAsyncMock(value));
    });
    eu(errResAsyncInspected).toBe<'value', unknown>(false, error);
    expect(errResAsyncMock).not.toHaveBeenCalled();

    const asyncOkValMock = vi.fn();
    const asyncOkValInspected = asyncOkVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      asyncOkValMock(value);
    });
    expect(asyncOkValMock).not.toHaveBeenCalled();
    await eua(asyncOkValInspected).toBe<P<'value'>, P<never>>(true, 'value');
    expect(asyncOkValMock).toHaveBeenCalledWith('value');

    const asyncOkValAsyncMock = vi.fn();
    const asyncOkValAsyncInspected = asyncOkVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(asyncOkValAsyncMock(value));
    });
    expect(asyncOkValAsyncMock).not.toHaveBeenCalled();
    await eua(asyncOkValAsyncInspected).toBe<P<'value'>, P<never>>(true, 'value');
    expect(asyncOkValAsyncMock).toHaveBeenCalledWith('value');

    const asyncErrValMock = vi.fn();
    const asyncErrValInspected = asyncErrVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      asyncErrValMock(value);
    });
    expect(asyncErrValMock).not.toHaveBeenCalled();
    await eua(asyncErrValInspected).toBe<P<never>, P<'error'>>(false, 'error');
    expect(asyncErrValMock).not.toHaveBeenCalled();

    const asyncErrValAsyncMock = vi.fn();
    const asyncErrValAsyncInspected = asyncErrVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(asyncErrValAsyncMock(value));
    });
    expect(asyncErrValAsyncMock).not.toHaveBeenCalled();
    await eua(asyncErrValAsyncInspected).toBe<P<never>, P<'error'>>(false, 'error');
    expect(asyncErrValAsyncMock).not.toHaveBeenCalled();

    const asyncOkResMock = vi.fn();
    const asyncOkResInspected = asyncOkResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      asyncOkResMock(value);
    });
    expect(asyncOkResMock).not.toHaveBeenCalled();
    await eua(asyncOkResInspected).toBe<P<'value'>, P<unknown>>(true, 'value');
    expect(asyncOkResMock).toHaveBeenCalledWith('value');

    const asyncOkResAsyncMock = vi.fn();
    const asyncOkResAsyncInspected = asyncOkResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(asyncOkResAsyncMock(value));
    });
    expect(asyncOkResAsyncMock).not.toHaveBeenCalled();
    await eua(asyncOkResAsyncInspected).toBe<P<'value'>, P<unknown>>(true, 'value');
    expect(asyncOkResAsyncMock).toHaveBeenCalledWith('value');

    const asyncErrResMock = vi.fn();
    const asyncErrResInspected = asyncErrResVal.inspect((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      asyncErrResMock(value);
    });
    expect(asyncErrResMock).not.toHaveBeenCalled();
    await eua(asyncErrResInspected).toBe<P<'value'>, P<unknown>>(false, error);
    expect(asyncErrResMock).not.toHaveBeenCalled();

    const asyncErrResAsyncMock = vi.fn();
    const asyncErrResAsyncInspected = asyncErrResVal.inspect(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      await Promise.resolve(asyncErrResAsyncMock(value));
    });
    expect(asyncErrResAsyncMock).not.toHaveBeenCalled();
    await eua(asyncErrResAsyncInspected).toBe<P<'value'>, P<unknown>>(false, error);
    expect(asyncErrResAsyncMock).not.toHaveBeenCalled();
  });

  test('inspectErr', async () => {
    const okValMock = vi.fn();
    const okValInspected = okVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      okValMock(value);
    });
    eu(okValInspected).toBe<'value', never>(true, 'value');
    expect(okValMock).not.toHaveBeenCalled();

    const okValAsyncMock = vi.fn();
    const okValAsyncInspected = okVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(okValAsyncMock(value));
    });
    eu(okValAsyncInspected).toBe<'value', never>(true, 'value');
    expect(okValAsyncMock).not.toHaveBeenCalled();

    const errValMock = vi.fn();
    const errValInspected = errVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      errValMock(value);
    });
    eu(errValInspected).toBe<never, 'error'>(false, 'error');
    expect(errValMock).toHaveBeenCalledWith('error');

    const errValAsyncMock = vi.fn();
    const errValAsyncInspected = errVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      await Promise.resolve(errValAsyncMock(value));
    });
    eu(errValAsyncInspected).toBe<never, 'error'>(false, 'error');
    expect(errValAsyncMock).toHaveBeenCalledWith('error');

    const okResMock = vi.fn();
    const okResInspected = okResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      okResMock(value);
    });
    eu(okResInspected).toBe<'value', unknown>(true, 'value');
    expect(okResMock).not.toHaveBeenCalled();

    const okResAsyncMock = vi.fn();
    const okResAsyncInspected = okResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(okResAsyncMock(value));
    });
    eu(okResAsyncInspected).toBe<'value', unknown>(true, 'value');
    expect(okResAsyncMock).not.toHaveBeenCalled();

    const errResMock = vi.fn();
    const errResInspected = errResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      errResMock(value);
    });
    eu(errResInspected).toBe<'value', unknown>(false, error);
    expect(errResMock).toHaveBeenCalledWith(error);

    const errResAsyncMock = vi.fn();
    const errResAsyncInspected = errResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(errResAsyncMock(value));
    });
    eu(errResAsyncInspected).toBe<'value', unknown>(false, error);
    expect(errResAsyncMock).toHaveBeenCalledWith(error);

    const asyncOkValMock = vi.fn();
    const asyncOkValInspected = asyncOkVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      asyncOkValMock(value);
    });
    expect(asyncOkValMock).not.toHaveBeenCalled();
    await eua(asyncOkValInspected).toBe<P<'value'>, P<never>>(true, 'value');
    expect(asyncOkValMock).not.toHaveBeenCalled();

    const asyncOkValAsyncMock = vi.fn();
    const asyncOkValAsyncInspected = asyncOkVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      await Promise.resolve(asyncOkValAsyncMock(value));
    });
    expect(asyncOkValAsyncMock).not.toHaveBeenCalled();
    await eua(asyncOkValAsyncInspected).toBe<P<'value'>, P<never>>(true, 'value');
    expect(asyncOkValAsyncMock).not.toHaveBeenCalled();

    const asyncErrValMock = vi.fn();
    const asyncErrValInspected = asyncErrVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      asyncErrValMock(value);
    });
    expect(asyncErrValMock).not.toHaveBeenCalled();
    await eua(asyncErrValInspected).toBe<P<never>, P<'error'>>(false, 'error');
    expect(asyncErrValMock).toHaveBeenCalledWith('error');

    const asyncErrValAsyncMock = vi.fn();
    const asyncErrValAsyncInspected = asyncErrVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'error'>();
      await Promise.resolve(asyncErrValAsyncMock(value));
    });
    expect(asyncErrValAsyncMock).not.toHaveBeenCalled();
    await eua(asyncErrValAsyncInspected).toBe<P<never>, P<'error'>>(false, 'error');
    expect(asyncErrValAsyncMock).toHaveBeenCalledWith('error');

    const asyncOkResMock = vi.fn();
    const asyncOkResInspected = asyncOkResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      asyncOkResMock(value);
    });
    expect(asyncOkResMock).not.toHaveBeenCalled();
    await eua(asyncOkResInspected).toBe<P<'value'>, P<unknown>>(true, 'value');
    expect(asyncOkResMock).not.toHaveBeenCalled();

    const asyncOkResAsyncMock = vi.fn();
    const asyncOkResAsyncInspected = asyncOkResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(asyncOkResAsyncMock(value));
    });
    expect(asyncOkResAsyncMock).not.toHaveBeenCalled();
    await eua(asyncOkResAsyncInspected).toBe<P<'value'>, P<unknown>>(true, 'value');
    expect(asyncOkResAsyncMock).not.toHaveBeenCalled();

    const asyncErrResMock = vi.fn();
    const asyncErrResInspected = asyncErrResVal.inspectErr((value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      asyncErrResMock(value);
    });
    expect(asyncErrResMock).not.toHaveBeenCalled();
    await eua(asyncErrResInspected).toBe<P<'value'>, P<unknown>>(false, error);
    expect(asyncErrResMock).toHaveBeenCalledWith(error);

    const asyncErrResAsyncMock = vi.fn();
    const asyncErrResAsyncInspected = asyncErrResVal.inspectErr(async (value) => {
      expectTypeOf(value).toEqualTypeOf<unknown>();
      await Promise.resolve(asyncErrResAsyncMock(value));
    });
    expect(asyncErrResAsyncMock).not.toHaveBeenCalled();
    await eua(asyncErrResAsyncInspected).toBe<P<'value'>, P<unknown>>(false, error);
    expect(asyncErrResAsyncMock).toHaveBeenCalledWith(error);
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
    expect(errResExpectErr).toStrictEqual(error);

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
    await expect(asyncErrResExpectErr).resolves.toStrictEqual(error);
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
    expect(errResUnwrapErr).toStrictEqual(error);

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
    await expect(asyncErrResUnwrapErr).resolves.toStrictEqual(error);
  });

  test('unwrapOr', async () => {
    const okUnwrapOr = okVal.unwrapOr(defaultValue);
    expectTypeOf(okUnwrapOr).toEqualTypeOf<'value'>();
    expect(okUnwrapOr).toBe('value');

    const okUnwrapOrAsync = okVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(okUnwrapOrAsync).toEqualTypeOf<'value'>();
    expect(okUnwrapOrAsync).toBe('value');

    const errUnwrapOr = errVal.unwrapOr(defaultValue);
    expectTypeOf(errUnwrapOr).toEqualTypeOf<'default'>();
    expect(errUnwrapOr).toBe('default');

    const errUnwrapOrAsync = errVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(errUnwrapOrAsync).resolves.toEqualTypeOf<'default'>();
    await expect(errUnwrapOrAsync).resolves.toBe('default');

    const okResUnwrapOr = okResVal.unwrapOr(defaultValue);
    expectTypeOf(okResUnwrapOr).toEqualTypeOf<'value' | 'default'>();
    expect(okResUnwrapOr).toBe('value');

    const okResUnwrapOrAsync = okResVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(okResUnwrapOrAsync).toEqualTypeOf<'value' | Promise<'default'>>();
    expect(okResUnwrapOrAsync).toBe('value');

    const errResUnwrapOr = errResVal.unwrapOr(defaultValue);
    expectTypeOf(errResUnwrapOr).toEqualTypeOf<'value' | 'default'>();
    expect(errResUnwrapOr).toBe('default');

    const errResUnwrapOrAsync = errResVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(errResUnwrapOrAsync).toEqualTypeOf<'value' | Promise<'default'>>();
    await expect(errResUnwrapOrAsync).resolves.toBe('default');

    const asyncOkUnwrapOr = asyncOkVal.unwrapOr(defaultValue);
    expectTypeOf(asyncOkUnwrapOr).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkUnwrapOr).resolves.toBe('value');

    const asyncOkUnwrapOrAsync = asyncOkVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(asyncOkUnwrapOrAsync).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkUnwrapOrAsync).resolves.toBe('value');

    const asyncErrUnwrapOr = asyncErrVal.unwrapOr(defaultValue);
    expectTypeOf(asyncErrUnwrapOr).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrUnwrapOr).resolves.toBe('default');

    const asyncErrUnwrapOrAsync = asyncErrVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(asyncErrUnwrapOrAsync).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrUnwrapOrAsync).resolves.toBe('default');

    const asyncOkResUnwrapOr = asyncOkResVal.unwrapOr(defaultValue);
    expectTypeOf(asyncOkResUnwrapOr).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncOkResUnwrapOr).resolves.toBe('value');

    const asyncOkResUnwrapOrAsync = asyncOkResVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(asyncOkResUnwrapOrAsync).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncOkResUnwrapOrAsync).resolves.toBe('value');

    const asyncErrResUnwrapOr = asyncErrResVal.unwrapOr(defaultValue);
    expectTypeOf(asyncErrResUnwrapOr).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncErrResUnwrapOr).resolves.toBe('default');

    const asyncErrResUnwrapOrAsync = asyncErrResVal.unwrapOr(asyncDefaultValue);
    expectTypeOf(asyncErrResUnwrapOrAsync).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncErrResUnwrapOrAsync).resolves.toBe('default');
  });

  test('unwrapOrElse', async () => {
    const okUnwrapOrElse = okVal.unwrapOrElse(defaultFn);
    expectTypeOf(okUnwrapOrElse).toEqualTypeOf<'value'>();
    expect(okUnwrapOrElse).toBe('value');

    const okUnwrapOrElseAsync = okVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(okUnwrapOrElseAsync).toEqualTypeOf<'value'>();
    expect(okUnwrapOrElseAsync).toBe('value');

    const errUnwrapOrElse = errVal.unwrapOrElse(defaultFn);
    expectTypeOf(errUnwrapOrElse).toEqualTypeOf<'default'>();
    expect(errUnwrapOrElse).toBe('default');

    const errUnwrapOrElseAsync = errVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(errUnwrapOrElseAsync).resolves.toEqualTypeOf<'default'>();
    await expect(errUnwrapOrElseAsync).resolves.toBe('default');

    const okResUnwrapOrElse = okResVal.unwrapOrElse(defaultFn);
    expectTypeOf(okResUnwrapOrElse).toEqualTypeOf<'value' | 'default'>();
    expect(okResUnwrapOrElse).toBe('value');

    const okResUnwrapOrElseAsync = okResVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(okResUnwrapOrElseAsync).toEqualTypeOf<'value' | Promise<'default'>>();
    expect(okResUnwrapOrElseAsync).toBe('value');

    const errResUnwrapOrElse = errResVal.unwrapOrElse(defaultFn);
    expectTypeOf(errResUnwrapOrElse).toEqualTypeOf<'value' | 'default'>();
    expect(errResUnwrapOrElse).toBe('default');

    const errResUnwrapOrElseAsync = errResVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(errResUnwrapOrElseAsync).toEqualTypeOf<'value' | Promise<'default'>>();
    await expect(errResUnwrapOrElseAsync).resolves.toBe('default');

    const asyncOkUnwrapOrElse = asyncOkVal.unwrapOrElse(defaultFn);
    expectTypeOf(asyncOkUnwrapOrElse).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkUnwrapOrElse).resolves.toBe('value');

    const asyncOkUnwrapOrElseAsync = asyncOkVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(asyncOkUnwrapOrElseAsync).resolves.toEqualTypeOf<'value'>();
    await expect(asyncOkUnwrapOrElseAsync).resolves.toBe('value');

    const asyncErrUnwrapOrElse = asyncErrVal.unwrapOrElse(defaultFn);
    expectTypeOf(asyncErrUnwrapOrElse).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrUnwrapOrElse).resolves.toBe('default');

    const asyncErrUnwrapOrElseAsync = asyncErrVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(asyncErrUnwrapOrElseAsync).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrUnwrapOrElseAsync).resolves.toBe('default');

    const asyncOkResUnwrapOrElse = asyncOkResVal.unwrapOrElse(defaultFn);
    expectTypeOf(asyncOkResUnwrapOrElse).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncOkResUnwrapOrElse).resolves.toBe('value');

    const asyncOkResUnwrapOrElseAsync = asyncOkResVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(asyncOkResUnwrapOrElseAsync).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncOkResUnwrapOrElseAsync).resolves.toBe('value');

    const asyncErrResUnwrapOrElse = asyncErrResVal.unwrapOrElse(defaultFn);
    expectTypeOf(asyncErrResUnwrapOrElse).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncErrResUnwrapOrElse).resolves.toBe('default');

    const asyncErrResUnwrapOrElseAsync = asyncErrResVal.unwrapOrElse(asyncDefaultFn);
    expectTypeOf(asyncErrResUnwrapOrElseAsync).resolves.toEqualTypeOf<'value' | 'default'>();
    await expect(asyncErrResUnwrapOrElseAsync).resolves.toBe('default');
  });

  test('ok', async () => {
    const okValOk = okVal.ok();
    expectTypeOf(okValOk).toEqualTypeOf<Some<'value'>>();
    expect(okValOk.isSome).toBe(true);
    expect(okValOk.isNone).toBe(false);
    expect(okValOk.unwrap()).toBe('value');

    const errValOk = errVal.ok();
    expectTypeOf(errValOk).toEqualTypeOf<None>();
    expect(errValOk.isSome).toBe(false);
    expect(errValOk.isNone).toBe(true);
    expect(() => errValOk.unwrap()).toThrow();

    const okResValOk = okResVal.ok();
    expectTypeOf(okResValOk).toEqualTypeOf<Option<'value'>>();
    expect(okResValOk.isSome).toBe(true);
    expect(okResValOk.isNone).toBe(false);
    expect(okResValOk.unwrap()).toBe('value');

    const errResValOk = errResVal.ok();
    expectTypeOf(errResValOk).toEqualTypeOf<Option<'value'>>();
    expect(errResValOk.isSome).toBe(false);
    expect(errResValOk.isNone).toBe(true);
    expect(() => errResValOk.unwrap()).toThrow();

    const asyncOkValOk = asyncOkVal.ok();
    expectTypeOf(asyncOkValOk).toEqualTypeOf<AsyncSome<'value'>>();
    await expect(asyncOkValOk.isSome).resolves.toBe(true);
    await expect(asyncOkValOk.isNone).resolves.toBe(false);
    await expect(asyncOkValOk.unwrap()).resolves.toBe('value');

    const asyncErrValOk = asyncErrVal.ok();
    expectTypeOf(asyncErrValOk).toEqualTypeOf<AsyncNone>();
    await expect(asyncErrValOk.isSome).resolves.toBe(false);
    await expect(asyncErrValOk.isNone).resolves.toBe(true);
    await expect(() => asyncErrValOk.unwrap()).rejects.toThrow();

    const asyncOkResValOk = asyncOkResVal.ok();
    expectTypeOf(asyncOkResValOk).toEqualTypeOf<AsyncNone | AsyncSome<'value'>>();
    await expect(asyncOkResValOk.isSome).resolves.toBe(true);
    await expect(asyncOkResValOk.isNone).resolves.toBe(false);
    await expect(asyncOkResValOk.unwrap()).resolves.toBe('value');

    const asyncErrResValOk = asyncErrResVal.ok();
    expectTypeOf(asyncErrResValOk).toEqualTypeOf<AsyncNone | AsyncSome<'value'>>();
    await expect(asyncErrResValOk.isSome).resolves.toBe(false);
    await expect(asyncErrResValOk.isNone).resolves.toBe(true);
    await expect(() => asyncErrResValOk.unwrap()).rejects.toThrow();
  });

  test('err', async () => {
    const okValErr = okVal.err();
    expectTypeOf(okValErr).toEqualTypeOf<None>();
    expect(okValErr.isSome).toBe(false);
    expect(okValErr.isNone).toBe(true);
    expect(() => okValErr.unwrap()).toThrow();

    const errValErr = errVal.err();
    expectTypeOf(errValErr).toEqualTypeOf<Some<'error'>>();
    expect(errValErr.isSome).toBe(true);
    expect(errValErr.isNone).toBe(false);
    expect(errValErr.unwrap()).toBe('error');

    const okResValErr = okResVal.err();
    expectTypeOf(okResValErr).toEqualTypeOf<Option<unknown>>();
    expect(okResValErr.isSome).toBe(false);
    expect(okResValErr.isNone).toBe(true);
    expect(() => okResValErr.unwrap()).toThrow();

    const errResValErr = errResVal.err();
    expectTypeOf(errResValErr).toEqualTypeOf<Option<unknown>>();
    expect(errResValErr.isSome).toBe(true);
    expect(errResValErr.isNone).toBe(false);
    expect(errResValErr.unwrap()).toStrictEqual(error);

    const asyncOkValErr = asyncOkVal.err();
    expectTypeOf(asyncOkValErr).toEqualTypeOf<AsyncNone>();
    await expect(asyncOkValErr.isSome).resolves.toBe(false);
    await expect(asyncOkValErr.isNone).resolves.toBe(true);
    await expect(() => asyncOkValErr.unwrap()).rejects.toThrow();

    const asyncErrValErr = asyncErrVal.err();
    expectTypeOf(asyncErrValErr).toEqualTypeOf<AsyncSome<'error'>>();
    await expect(asyncErrValErr.isSome).resolves.toBe(true);
    await expect(asyncErrValErr.isNone).resolves.toBe(false);
    await expect(asyncErrValErr.unwrap()).resolves.toBe('error');

    const asyncOkResValErr = asyncOkResVal.err();
    expectTypeOf(asyncOkResValErr).toEqualTypeOf<AsyncNone | AsyncSome<unknown>>();
    await expect(asyncOkResValErr.isSome).resolves.toBe(false);
    await expect(asyncOkResValErr.isNone).resolves.toBe(true);
    await expect(() => asyncOkResValErr.unwrap()).rejects.toThrow();

    const asyncErrResValErr = asyncErrResVal.err();
    expectTypeOf(asyncErrResValErr).toEqualTypeOf<AsyncNone | AsyncSome<unknown>>();
    await expect(asyncErrResValErr.isSome).resolves.toBe(true);
    await expect(asyncErrResValErr.isNone).resolves.toBe(false);
    await expect(asyncErrResValErr.unwrap()).resolves.toStrictEqual(error);
  });

  test.todo('transpose', async () => {
    // const okNone = ok(none).transpose();
    // expectTypeOf(okNone).toEqualTypeOf<None>();
    // expect(okNone.isNone).toBe(true);
    // const okSome = ok(some('value')).transpose();
    // expectTypeOf(okSome).toEqualTypeOf<Some<Ok<'value'>>>();
    // expect(okSome.isSome).toBe(true);
    // expect(okSome.unwrap().isOk).toBe(true);
    // expect(okSome.unwrap().unwrap()).toBe('value');
    // const okTransposed = okVal.transpose();
    // expectTypeOf(okTransposed).toEqualTypeOf<Some<Ok<'value'>>>();
    // expect(okTransposed.isSome).toBe(true);
    // expect(okTransposed.unwrap().isOk).toBe(true);
    // expect(okTransposed.unwrap().unwrap()).toBe('value');
    // const errNone = err(none).transpose();
    // expectTypeOf(errNone).toEqualTypeOf<Some<Err<None>>>();
    // expect(errNone.isSome).toBe(true);
    // expect(errNone.unwrap().isErr).toBe(true);
    // expect(errNone.unwrap().unwrapErr().isNone).toBe(true);
    // const errSome = err(some('value')).transpose();
    // expectTypeOf(errSome).toEqualTypeOf<Some<Err<Some<'value'>>>>();
    // expect(errSome.isSome).toBe(true);
    // expect(errSome.unwrap().isErr).toBe(true);
    // expect(errSome.unwrap().unwrapErr().isSome).toBe(true);
    // expect(errSome.unwrap().unwrapErr().unwrap()).toBe('value');
    // const errTransposed = errVal.transpose();
    // expectTypeOf(errTransposed).toEqualTypeOf<Some<Err<'error'>>>();
    // expect(errTransposed.isSome).toBe(true);
    // expect(errTransposed.unwrap().isErr).toBe(true);
    // expect(errTransposed.unwrap().unwrapErr()).toBe('error');
    // const asyncOkNone = asyncOk(none).transpose();
    // expectTypeOf(asyncOkNone).toEqualTypeOf<Promise<None>>(); // TODO AsyncNone
    // // expect(asyncOkNone.isNone).resolves.toBe(true);
    // const asyncOkSome = asyncOk(some('value')).transpose();
    // expectTypeOf(asyncOkSome).toEqualTypeOf<Promise<Some<Ok<'value'>>>>(); // TODO AsyncSome
    // // expect(asyncOkSome.isSome).resolves.toBe(true);
    // const asyncOkTransposed = asyncOkVal.transpose();
    // expectTypeOf(asyncOkTransposed).toEqualTypeOf<Promise<Some<Ok<'value'>>>>(); // TODO AsyncSome
    // // expect(asyncOkSome.isSome).resolves.toBe(true);
    // const asyncErrNone = asyncErr(none).transpose();
    // expectTypeOf(asyncErrNone).toEqualTypeOf<Promise<Some<Err<None>>>>(); // TODO AsyncSome
    // // expect(asyncErrNone.isSome).resolves.toBe(true);
    // const asyncErrSome = asyncErr(some('value')).transpose();
    // expectTypeOf(asyncErrSome).toEqualTypeOf<Promise<Some<Err<Some<'value'>>>>>(); // TODO AsyncSome
    // // expect(asyncErrSome.isSome).resolves.toBe(true);
    // const asyncErrTransposed = asyncErrVal.transpose();
    // expectTypeOf(asyncErrTransposed).toEqualTypeOf<Promise<Some<Err<'error'>>>>(); // TODO AsyncSome
    // // expect(asyncErrTransposed.isSome).resolves.toBe(true);
  });

  test.todo('flatten', async () => {
    // await Promise.all([
    //   await expectAsyncUnwrap(okVal.flatten()).toBe<'value', never>(true, 'value'),
    //   await expectAsyncUnwrap(ok(okVal).flatten()).toBe<'value', never>(true, 'value'),
    //   await expectAsyncUnwrap(err(okVal).flatten()).toBe<never, Ok<'value'>>(false, okVal),
    //   await expectAsyncUnwrap(asyncOk(okVal).flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
    //   await expectAsyncUnwrap(asyncErr(okVal).flatten()).toBe<P<never>, P<Ok<'value'>>>(false, okVal),
    //   await expectAsyncUnwrap(errVal.flatten()).toBe<never, 'error'>(false, 'error'),
    //   await expectAsyncUnwrap(ok(errVal).flatten()).toBe<never, 'error'>(false, 'error'),
    //   await expectAsyncUnwrap(err(errVal).flatten()).toBe<never, Err<'error'>>(false, errVal),
    //   await expectAsyncUnwrap(asyncOk(errVal).flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
    //   await expectAsyncUnwrap(asyncErr(errVal).flatten()).toBe<P<never>, P<Err<'error'>>>(false, errVal),
    //   await expectAsyncUnwrap(asyncOkVal.flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
    //   await expectAsyncUnwrap(ok(asyncOkVal).flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
    //   await expectAsyncUnwrap(err(asyncOkVal).flatten()).toBe<never, AsyncOk<'value'>>(false, okVal),
    //   await expectAsyncUnwrap(asyncOk(asyncOkVal).flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
    //   await expectAsyncUnwrap(asyncErr(asyncOkVal).flatten()).toBe<P<never>, P<Ok<'value'>>>(false, okVal),
    //   await expectAsyncUnwrap(asyncErrVal.flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
    //   await expectAsyncUnwrap(ok(asyncErrVal).flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
    //   await expectAsyncUnwrap(err(asyncErrVal).flatten()).toBe<never, AsyncErr<'error'>>(false, errVal),
    //   await expectAsyncUnwrap(asyncOk(asyncErrVal).flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
    //   await expectAsyncUnwrap(asyncErr(asyncErrVal).flatten()).toBe<P<never>, P<Err<'error'>>>(false, errVal),
    //   await expectAsyncUnwrap(okResVal.flatten()).toBe<'value', unknown>(true, 'value'),
    //   await expectAsyncUnwrap(ok(okResVal).flatten()).toBe<'value', unknown>(true, 'value'),
    //   await expectAsyncUnwrap(err(okResVal).flatten()).toBe<never, ResVal>(false, okResVal),
    //   await expectAsyncUnwrap(asyncOk(okResVal).flatten()).toBe<P<'value'>, P<unknown>>(true, 'value'),
    //   await expectAsyncUnwrap(asyncErr(okResVal).flatten()).toBe<P<never>, P<ResVal>>(false, okVal),
    //   await expectAsyncUnwrap(errResVal.flatten()).toBe<'value', unknown>(false, Error('error')),
    //   await expectAsyncUnwrap(ok(errResVal).flatten()).toBe<'value', unknown>(false, Error('error')),
    //   await expectAsyncUnwrap(err(errResVal).flatten()).toBe<never, ResVal>(false, errResVal),
    //   await expectAsyncUnwrap(asyncOk(errResVal).flatten()).toBe<P<'value'>, P<unknown>>(false, Error('error')),
    //   await expectAsyncUnwrap(asyncErr(errResVal).flatten()).toBe<P<never>, P<ResVal>>(false, errResVal),
    //   await expectAsyncUnwrap(asyncOkResVal.flatten()).toBe<P<'value'>, P<unknown>>(true, 'value'),
    //   await expectAsyncUnwrap(ok(asyncOkResVal).flatten()).toBe<P<'value'>, P<unknown>>(true, 'value'),
    //   await expectAsyncUnwrap(err(asyncOkResVal).flatten()).toBe<never, AsyncResVal>(false, okResVal),
    //   await expectAsyncUnwrap(asyncOk(asyncOkResVal).flatten()).toBe<P<'value'>, Promise<unknown>>(true, 'value'),
    //   await expectAsyncUnwrap(asyncErr(asyncOkResVal).flatten()).toBe<P<never>, P<ResVal>>(false, okVal),
    //   await expectAsyncUnwrap(asyncErrResVal.flatten()).toBe<P<'value'>, P<unknown>>(false, Error('error')),
    //   await expectAsyncUnwrap(ok(asyncErrResVal).flatten()).toBe<P<'value'>, P<unknown>>(false, Error('error')),
    //   await expectAsyncUnwrap(err(asyncErrResVal).flatten()).toBe<never, AsyncResVal>(false, errResVal),
    //   await expectAsyncUnwrap(asyncOk(asyncErrResVal).flatten()).toBe<P<'value'>, P<unknown>>(
    //     false,
    //     Error('error'),
    //   ),
    //   await expectAsyncUnwrap(asyncErr(asyncErrResVal).flatten()).toBe<P<never>, P<ResVal>>(false, errResVal),
    // ]);
  });

  test('map', async () => {
    const okValMapped = okVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    eu(okValMapped).toBe<Mapped, never>(true, mappedValue);

    const okValAsyncMapped = okVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    await eua(okValAsyncMapped).toBe<P<Mapped>, P<never>>(true, mappedValue);

    const errValMapped = errVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    eu(errValMapped).toBe<never, 'error'>(false, 'error');

    const errValAsyncMapped = errVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    eu(errValAsyncMapped).toBe<never, 'error'>(false, 'error');

    const okResValMapped = okResVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    eu(okResValMapped).toBe<Mapped, unknown>(true, mappedValue);

    const okResValAsyncMapped = okResVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    await eua(okResValAsyncMapped).toBe<P<Mapped>, unknown>(true, mappedValue);

    const errResValMapped = errResVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    eu(errResValMapped).toBe<Mapped, unknown>(false, error);

    const errResValAsyncMapped = errResVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    eu(errResValAsyncMapped).toBe<P<Mapped>, unknown>(false, error);

    const asyncOkValMapped = asyncOkVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    await eua(asyncOkValMapped).toBe<P<Mapped>, P<never>>(true, mappedValue);

    const asyncOkValAsyncMapped = asyncOkVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    await eua(asyncOkValAsyncMapped).toBe<P<Mapped>, P<never>>(true, mappedValue);

    const asyncErrValMapped = asyncErrVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    await eua(asyncErrValMapped).toBe<P<never>, P<'error'>>(false, 'error');

    const asyncErrValAsyncMapped = asyncErrVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    await eua(asyncErrValAsyncMapped).toBe<P<never>, P<'error'>>(false, 'error');

    // TODO Why doesn't this simplify? `P<never> | P<string>` => `P<never | string>` => `P<string>`
    const asyncOkResValMapped = asyncOkResVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    await eua(asyncOkResValMapped).toBe<P<never> | P<Mapped>, P<never> | P<unknown>>(
      true,
      mappedValue,
    );

    const asyncOkResValAsyncMapped = asyncOkResVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    await eua(asyncOkResValAsyncMapped).toBe<P<never> | P<Mapped>, P<never> | P<unknown>>(
      true,
      mappedValue,
    );

    const asyncErrResValMapped = asyncErrResVal.map((value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    await eua(asyncErrResValMapped).toBe<P<never> | P<Mapped>, P<never> | P<unknown>>(false, error);

    const asyncErrResValAsyncMapped = asyncErrResVal.map(async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    await eua(asyncErrResValAsyncMapped).toBe<P<never> | P<Mapped>, P<never> | P<unknown>>(
      false,
      error,
    );
  });

  test('mapErr', async () => {
    const okValMappedErr = okVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<never>();
      return mappedValue;
    });
    eu(okValMappedErr).toBe<'value', never>(true, 'value');

    const okValAsyncMappedErr = okVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    eu(okValAsyncMappedErr).toBe<'value', never>(true, 'value');

    const errValMappedErr = errVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<'error'>();
      return mappedValue;
    });
    eu(errValMappedErr).toBe<never, Mapped>(false, mappedValue);

    const errValAsyncMappedErr = errVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<'error'>();
      return await asyncMappedValue;
    });
    await eua(errValAsyncMappedErr).toBe<P<never>, P<Mapped>>(false, mappedValue);

    const okResValMappedErr = okResVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return mappedValue;
    });
    eu(okResValMappedErr).toBe<'value', Mapped>(true, 'value');

    const okResValAsyncMappedErr = okResVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return await asyncMappedValue;
    });
    eu(okResValAsyncMappedErr).toBe<'value' | P<never>, P<Mapped>>(true, 'value');

    const errResValMappedErr = errResVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return mappedValue;
    });
    eu(errResValMappedErr).toBe<'value', Mapped>(false, mappedValue);

    const errResValAsyncMappedErr = errResVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return await asyncMappedValue;
    });
    await eua(errResValAsyncMappedErr).toBe<'value' | P<never>, P<Mapped>>(false, mappedValue);

    const asyncOkValMappedErr = asyncOkVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<never>();
      return mappedValue;
    });
    await eua(asyncOkValMappedErr).toBe<P<'value'>, P<never>>(true, 'value');

    const asyncOkValAsyncMappedErr = asyncOkVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    await eua(asyncOkValAsyncMappedErr).toBe<P<'value'>, P<never>>(true, 'value');

    const asyncErrValMappedErr = asyncErrVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<'error'>();
      return mappedValue;
    });
    await eua(asyncErrValMappedErr).toBe<P<never>, P<Mapped>>(false, mappedValue);

    const asyncErrValAsyncMappedErr = asyncErrVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<'error'>();
      return await asyncMappedValue;
    });
    await eua(asyncErrValAsyncMappedErr).toBe<P<never>, P<Mapped>>(false, mappedValue);

    const asyncOkResValMappedErr = asyncOkResVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return mappedValue;
    });
    await eua(asyncOkResValMappedErr).toBe<P<'value'> | P<never>, P<Mapped> | P<never>>(
      true,
      'value',
    );

    const asyncOkResValAsyncMappedErr = asyncOkResVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return await asyncMappedValue;
    });
    await eua(asyncOkResValAsyncMappedErr).toBe<P<'value'> | P<never>, P<Mapped> | P<never>>(
      true,
      'value',
    );

    const asyncErrResValMappedErr = asyncErrResVal.mapErr((err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return mappedValue;
    });
    await eua(asyncErrResValMappedErr).toBe<P<'value'> | P<never>, P<Mapped> | P<never>>(
      false,
      mappedValue,
    );

    const asyncErrResValAsyncMappedErr = asyncErrResVal.mapErr(async (err) => {
      expectTypeOf(err).toEqualTypeOf<unknown>();
      return await asyncMappedValue;
    });
    await eua(asyncErrResValAsyncMappedErr).toBe<P<'value'> | P<never>, P<Mapped> | P<never>>(
      false,
      mappedValue,
    );
  });

  test('mapOr', async () => {
    const okValMappedOr = okVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okValMappedOr).toEqualTypeOf<Mapped>();
    expect(okValMappedOr).toBe(mappedValue);

    const okValAsyncMappedOr = okVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okValAsyncMappedOr).toEqualTypeOf<Mapped>();
    expect(okValAsyncMappedOr).toBe(mappedValue);

    const okValMappedOrAsync = okVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(okValMappedOrAsync).resolves.toEqualTypeOf<Mapped>();
    await expect(okValMappedOrAsync).resolves.toBe(mappedValue);

    const errValMappedOr = errVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(errValMappedOr).toEqualTypeOf<'default'>();
    expect(errValMappedOr).toBe('default');

    const errValAsyncMappedOr = errVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(errValAsyncMappedOr).resolves.toEqualTypeOf<'default'>();
    await expect(errValAsyncMappedOr).resolves.toBe('default');

    const errValMappedOrAsync = errVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    expectTypeOf(errValMappedOrAsync).toEqualTypeOf<'default'>();
    expect(errValMappedOrAsync).toBe('default');

    const okResValMappedOr = okResVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okResValMappedOr).toEqualTypeOf<Mapped | 'default'>();
    expect(okResValMappedOr).toBe(mappedValue);

    const okResValAsyncMappedOr = okResVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okResValAsyncMappedOr).toEqualTypeOf<Mapped | P<'default'>>();
    expect(okResValAsyncMappedOr).toBe(mappedValue);

    const okResValMappedOrAsync = okResVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(okResValMappedOrAsync).toEqualTypeOf<P<Mapped> | 'default'>();
    await expect(okResValMappedOrAsync).resolves.toBe(mappedValue);

    const errResValMappedOr = errResVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(errResValMappedOr).toEqualTypeOf<Mapped | 'default'>();
    expect(errResValMappedOr).toBe('default');

    const errResValAsyncMappedOr = errResVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(errResValAsyncMappedOr).toEqualTypeOf<Mapped | P<'default'>>();
    await expect(errResValAsyncMappedOr).resolves.toBe('default');

    const errResValMappedOrAsync = errResVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(errResValMappedOrAsync).toEqualTypeOf<P<Mapped> | 'default'>();
    expect(errResValMappedOrAsync).toBe('default');

    const asyncOkValMappedOr = asyncOkVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkValMappedOr).resolves.toEqualTypeOf<Mapped>();
    await expect(asyncOkValMappedOr).resolves.toBe(mappedValue);

    const asyncOkValAsyncMappedOr = asyncOkVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkValAsyncMappedOr).resolves.toEqualTypeOf<Mapped>();
    await expect(asyncOkValAsyncMappedOr).resolves.toBe(mappedValue);

    const asyncOkValMappedOrAsync = asyncOkVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncOkValMappedOrAsync).resolves.toEqualTypeOf<Mapped>();
    await expect(asyncOkValMappedOrAsync).resolves.toBe(mappedValue);

    const asyncErrValMappedOr = asyncErrVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(asyncErrValMappedOr).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrValMappedOr).resolves.toBe('default');

    const asyncErrValAsyncMappedOr = asyncErrVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(asyncErrValAsyncMappedOr).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrValAsyncMappedOr).resolves.toBe('default');

    const asyncErrValMappedOrAsync = asyncErrVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncErrValMappedOrAsync).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrValMappedOrAsync).resolves.toBe('default');

    const asyncOkResValMappedOr = asyncOkResVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkResValMappedOr).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncOkResValMappedOr).resolves.toBe(mappedValue);

    const asyncOkResValAsyncMappedOr = asyncOkResVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkResValAsyncMappedOr).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncOkResValAsyncMappedOr).resolves.toBe(mappedValue);

    const asyncOkResValMappedOrAsync = asyncOkResVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncOkResValMappedOrAsync).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncOkResValMappedOrAsync).resolves.toBe(mappedValue);

    const asyncErrResValMappedOr = asyncErrResVal.mapOr(defaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncErrResValMappedOr).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncErrResValMappedOr).resolves.toBe('default');

    const asyncErrResValAsyncMappedOr = asyncErrResVal.mapOr(asyncDefaultValue, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncErrResValAsyncMappedOr).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncErrResValAsyncMappedOr).resolves.toBe('default');

    const asyncErrResValMappedOrAsync = asyncErrResVal.mapOr(defaultValue, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncErrResValMappedOrAsync).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncErrResValMappedOrAsync).resolves.toBe('default');
  });

  test('mapOrElse', async () => {
    const okValMappedOrElse = okVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okValMappedOrElse).toEqualTypeOf<Mapped>();
    expect(okValMappedOrElse).toBe(mappedValue);

    const okValAsyncMappedOrElse = okVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okValAsyncMappedOrElse).toEqualTypeOf<Mapped>();
    expect(okValAsyncMappedOrElse).toBe(mappedValue);

    const okValMappedOrElseAsync = okVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(okValMappedOrElseAsync).resolves.toEqualTypeOf<Mapped>();
    await expect(okValMappedOrElseAsync).resolves.toBe(mappedValue);

    const errValMappedOrElse = errVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(errValMappedOrElse).toEqualTypeOf<'default'>();
    expect(errValMappedOrElse).toBe('default');

    const errValAsyncMappedOrElse = errVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(errValAsyncMappedOrElse).resolves.toEqualTypeOf<'default'>();
    await expect(errValAsyncMappedOrElse).resolves.toBe('default');

    const errValMappedOrElseAsync = errVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    expectTypeOf(errValMappedOrElseAsync).toEqualTypeOf<'default'>();
    expect(errValMappedOrElseAsync).toBe('default');

    const okResValMappedOrElse = okResVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okResValMappedOrElse).toEqualTypeOf<Mapped | 'default'>();
    expect(okResValMappedOrElse).toBe(mappedValue);

    const okResValAsyncMappedOrElse = okResVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(okResValAsyncMappedOrElse).toEqualTypeOf<Mapped | P<'default'>>();
    expect(okResValAsyncMappedOrElse).toBe(mappedValue);

    const okResValMappedOrElseAsync = okResVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(okResValMappedOrElseAsync).toEqualTypeOf<P<Mapped> | 'default'>();
    await expect(okResValMappedOrElseAsync).resolves.toBe(mappedValue);

    const errResValMappedOrElse = errResVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(errResValMappedOrElse).toEqualTypeOf<Mapped | 'default'>();
    expect(errResValMappedOrElse).toBe('default');

    const errResValAsyncMappedOrElse = errResVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(errResValAsyncMappedOrElse).toEqualTypeOf<Mapped | P<'default'>>();
    await expect(errResValAsyncMappedOrElse).resolves.toBe('default');

    const errResValMappedOrElseAsync = errResVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(errResValMappedOrElseAsync).toEqualTypeOf<P<Mapped> | 'default'>();
    expect(errResValMappedOrElseAsync).toBe('default');

    const asyncOkValMappedOrElse = asyncOkVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkValMappedOrElse).resolves.toEqualTypeOf<Mapped>();
    await expect(asyncOkValMappedOrElse).resolves.toBe(mappedValue);

    const asyncOkValAsyncMappedOrElse = asyncOkVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkValAsyncMappedOrElse).resolves.toEqualTypeOf<Mapped>();
    await expect(asyncOkValAsyncMappedOrElse).resolves.toBe(mappedValue);

    const asyncOkValMappedOrElseAsync = asyncOkVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncOkValMappedOrElseAsync).resolves.toEqualTypeOf<Mapped>();
    await expect(asyncOkValMappedOrElseAsync).resolves.toBe(mappedValue);

    const asyncErrValMappedOrElse = asyncErrVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(asyncErrValMappedOrElse).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrValMappedOrElse).resolves.toBe('default');

    const asyncErrValAsyncMappedOrElse = asyncErrVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return mappedValue;
    });
    expectTypeOf(asyncErrValAsyncMappedOrElse).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrValAsyncMappedOrElse).resolves.toBe('default');

    const asyncErrValMappedOrElseAsync = asyncErrVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<never>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncErrValMappedOrElseAsync).resolves.toEqualTypeOf<'default'>();
    await expect(asyncErrValMappedOrElseAsync).resolves.toBe('default');

    const asyncOkResValMappedOrElse = asyncOkResVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkResValMappedOrElse).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncOkResValMappedOrElse).resolves.toBe(mappedValue);

    const asyncOkResValAsyncMappedOrElse = asyncOkResVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncOkResValAsyncMappedOrElse).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncOkResValAsyncMappedOrElse).resolves.toBe(mappedValue);

    const asyncOkResValMappedOrElseAsync = asyncOkResVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncOkResValMappedOrElseAsync).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncOkResValMappedOrElseAsync).resolves.toBe(mappedValue);

    const asyncErrResValMappedOrElse = asyncErrResVal.mapOrElse(defaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncErrResValMappedOrElse).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncErrResValMappedOrElse).resolves.toBe('default');

    const asyncErrResValAsyncMappedOrElse = asyncErrResVal.mapOrElse(asyncDefaultFn, (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return mappedValue;
    });
    expectTypeOf(asyncErrResValAsyncMappedOrElse).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncErrResValAsyncMappedOrElse).resolves.toBe('default');

    const asyncErrResValMappedOrElseAsync = asyncErrResVal.mapOrElse(defaultFn, async (value) => {
      expectTypeOf(value).toEqualTypeOf<'value'>();
      return await asyncMappedValue;
    });
    expectTypeOf(asyncErrResValMappedOrElseAsync).resolves.toEqualTypeOf<Mapped | 'default'>();
    await expect(asyncErrResValMappedOrElseAsync).resolves.toBe('default');
  });

  test('and', async () => {
    eu(ok1.and(ok2)).toBe<'v2', never>(true, 'v2');
    eu(ok1.and(err2)).toBe<never, 'e2'>(false, 'e2');
    await eua(ok1.and(asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(ok1.and(asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    eu(ok1.and(okRes2)).toBe<'v2', 'e2'>(true, 'v2');
    eu(ok1.and(errRes2)).toBe<'v2', 'e2'>(false, 'e2');
    await eua(ok1.and(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(ok1.and(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(ok1.and(Promise.resolve(ok2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(ok1.and(Promise.resolve(err2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(ok1.and(Promise.resolve(asyncOk2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(ok1.and(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(ok1.and(Promise.resolve(okRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(ok1.and(Promise.resolve(errRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(ok1.and(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(ok1.and(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    eu(err1.and(ok2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(err2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(asyncOk2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(asyncErr2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(okRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(errRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(asyncOkRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(asyncErrRes2)).toBe<never, 'e1'>(false, 'e1');

    eu(err1.and(Promise.resolve(ok2))).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(Promise.resolve(err2))).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(Promise.resolve(asyncOk2))).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(Promise.resolve(asyncErr2))).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(Promise.resolve(okRes2))).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(Promise.resolve(errRes2))).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(Promise.resolve(asyncOkRes2))).toBe<never, 'e1'>(false, 'e1');
    eu(err1.and(Promise.resolve(asyncErrRes2))).toBe<never, 'e1'>(false, 'e1');

    eu(okRes1.and(ok2)).toBe<'v2', 'e1'>(true, 'v2');
    eu(okRes1.and(err2)).toBe<never, 'e1' | 'e2'>(false, 'e2');
    await eua(okRes1.and(asyncOk2)).toBe<P<'v2'>, 'e1' | P<never>>(true, 'v2');
    await eua(okRes1.and(asyncErr2)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e2');
    eu(okRes1.and(okRes2)).toBe<'v2', 'e1' | 'e2'>(true, 'v2');
    eu(okRes1.and(errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e2');
    await eua(okRes1.and(asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2');
    await eua(okRes1.and(asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2');

    await eua(okRes1.and(Promise.resolve(ok2))).toBe<P<'v2'>, 'e1' | P<never>>(true, 'v2');
    await eua(okRes1.and(Promise.resolve(err2))).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e2');
    await eua(okRes1.and(Promise.resolve(asyncOk2))).toBe<P<'v2'>, 'e1' | P<never>>(true, 'v2');
    await eua(okRes1.and(Promise.resolve(asyncErr2))).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e2');
    await eua(okRes1.and(Promise.resolve(okRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2');
    await eua(okRes1.and(Promise.resolve(errRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2');
    await eua(okRes1.and(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2');
    await eua(okRes1.and(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2');

    eu(errRes1.and(ok2)).toBe<'v2', 'e1'>(false, 'e1');
    eu(errRes1.and(err2)).toBe<never, 'e1' | 'e2'>(false, 'e1');
    eu(errRes1.and(asyncOk2)).toBe<P<'v2'>, 'e1' | P<never>>(false, 'e1');
    eu(errRes1.and(asyncErr2)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.and(okRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1');
    eu(errRes1.and(errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1');
    eu(errRes1.and(asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.and(asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');

    eu(errRes1.and(Promise.resolve(ok2))).toBe<P<'v2'>, 'e1' | P<never>>(false, 'e1');
    eu(errRes1.and(Promise.resolve(err2))).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.and(Promise.resolve(asyncOk2))).toBe<P<'v2'>, 'e1' | P<never>>(false, 'e1');
    eu(errRes1.and(Promise.resolve(asyncErr2))).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.and(Promise.resolve(okRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.and(Promise.resolve(errRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.and(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.and(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');

    await eua(asyncOk1.and(ok2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.and(err2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.and(asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.and(asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.and(okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.and(errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.and(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.and(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncOk1.and(Promise.resolve(ok2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.and(Promise.resolve(err2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.and(Promise.resolve(asyncOk2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.and(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.and(Promise.resolve(okRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.and(Promise.resolve(errRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.and(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.and(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncErr1.and(ok2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(err2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(asyncOk2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(asyncErr2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(okRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(errRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(asyncOkRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(asyncErrRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');

    await eua(asyncErr1.and(Promise.resolve(ok2))).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(Promise.resolve(err2))).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(Promise.resolve(asyncOk2))).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(Promise.resolve(okRes2))).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(Promise.resolve(errRes2))).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(Promise.resolve(asyncOk2))).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.and(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e1'>>(false, 'e1');

    await eua(asyncOkRes1.and(ok2)).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.and(err2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.and(asyncOk2)).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.and(asyncErr2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.and(okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2');
    await eua(asyncOkRes1.and(errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.and(asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2');
    await eua(asyncOkRes1.and(asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2');

    await eua(asyncOkRes1.and(Promise.resolve(ok2))).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.and(Promise.resolve(err2))).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.and(Promise.resolve(asyncOk2))).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.and(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e1' | 'e2'>>(
      false,
      'e2',
    );
    await eua(asyncOkRes1.and(Promise.resolve(okRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2');
    await eua(asyncOkRes1.and(Promise.resolve(errRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.and(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(
      true,
      'v2',
    );
    await eua(asyncOkRes1.and(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(
      false,
      'e2',
    );

    await eua(asyncErrRes1.and(ok2)).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.and(err2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.and(asyncOk2)).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.and(asyncErr2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.and(okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.and(errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.and(asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.and(asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');

    await eua(asyncErrRes1.and(Promise.resolve(ok2))).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.and(Promise.resolve(err2))).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.and(Promise.resolve(asyncOk2))).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.and(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e1' | 'e2'>>(
      false,
      'e1',
    );
    await eua(asyncErrRes1.and(Promise.resolve(okRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.and(Promise.resolve(errRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(
      false,
      'e1',
    );
    await eua(asyncErrRes1.and(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(
      false,
      'e1',
    );
    await eua(asyncErrRes1.and(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, P<'e1' | 'e2'>>(
      false,
      'e1',
    );
  });

  test('or', async () => {
    eu(ok1.or(ok2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(err2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(asyncOk2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(asyncErr2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(okRes2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(errRes2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(asyncOkRes2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(asyncErrRes2)).toBe<'v1', never>(true, 'v1');

    eu(ok1.or(Promise.resolve(ok2))).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(Promise.resolve(err2))).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(Promise.resolve(asyncOk2))).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(Promise.resolve(asyncErr2))).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(Promise.resolve(okRes2))).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(Promise.resolve(errRes2))).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(Promise.resolve(asyncOkRes2))).toBe<'v1', never>(true, 'v1');
    eu(ok1.or(Promise.resolve(asyncErrRes2))).toBe<'v1', never>(true, 'v1');

    eu(err1.or(ok2)).toBe<'v2', never>(true, 'v2');
    eu(err1.or(err2)).toBe<never, 'e2'>(false, 'e2');
    await eua(err1.or(asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(err1.or(asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    eu(err1.or(okRes2)).toBe<'v2', 'e2'>(true, 'v2');
    eu(err1.or(errRes2)).toBe<'v2', 'e2'>(false, 'e2');
    await eua(err1.or(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(err1.or(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(err1.or(Promise.resolve(ok2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(err1.or(Promise.resolve(err2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(err1.or(Promise.resolve(asyncOk2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(err1.or(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(err1.or(Promise.resolve(okRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(err1.or(Promise.resolve(errRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(err1.or(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(err1.or(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    eu(okRes1.or(ok2)).toBe<'v1' | 'v2', never>(true, 'v1');
    eu(okRes1.or(err2)).toBe<'v1', 'e2'>(true, 'v1');
    eu(okRes1.or(asyncOk2)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v1');
    eu(okRes1.or(asyncErr2)).toBe<'v1' | P<never>, P<'e2'>>(true, 'v1');
    eu(okRes1.or(okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1');
    eu(okRes1.or(errRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1');
    eu(okRes1.or(asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.or(asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');

    eu(okRes1.or(Promise.resolve(ok2))).toBe<'v1' | P<'v2'>, P<never>>(true, 'v1');
    eu(okRes1.or(Promise.resolve(err2))).toBe<'v1' | P<never>, P<'e2'>>(true, 'v1');
    eu(okRes1.or(Promise.resolve(asyncOk2))).toBe<'v1' | P<'v2'>, P<never>>(true, 'v1');
    eu(okRes1.or(Promise.resolve(asyncErr2))).toBe<'v1' | P<never>, P<'e2'>>(true, 'v1');
    eu(okRes1.or(Promise.resolve(okRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.or(Promise.resolve(errRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.or(Promise.resolve(asyncOkRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.or(Promise.resolve(asyncErrRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');

    eu(errRes1.or(ok2)).toBe<'v1' | 'v2', never>(true, 'v2');
    eu(errRes1.or(err2)).toBe<'v1', 'e2'>(false, 'e2');
    await eua(errRes1.or(asyncOk2)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v2');
    await eua(errRes1.or(asyncErr2)).toBe<'v1' | P<never>, P<'e2'>>(false, 'e2');
    eu(errRes1.or(okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v2');
    eu(errRes1.or(errRes2)).toBe<'v1' | 'v2', 'e2'>(false, 'e2');
    await eua(errRes1.or(asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(errRes1.or(asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(errRes1.or(Promise.resolve(ok2))).toBe<'v1' | P<'v2'>, P<never>>(true, 'v2');
    await eua(errRes1.or(Promise.resolve(err2))).toBe<'v1' | P<never>, P<'e2'>>(false, 'e2');
    await eua(errRes1.or(Promise.resolve(asyncOk2))).toBe<'v1' | P<'v2'>, P<never>>(true, 'v2');
    await eua(errRes1.or(Promise.resolve(asyncErr2))).toBe<'v1' | P<never>, P<'e2'>>(false, 'e2');
    await eua(errRes1.or(Promise.resolve(okRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(errRes1.or(Promise.resolve(errRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(errRes1.or(Promise.resolve(asyncOkRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(errRes1.or(Promise.resolve(asyncErrRes2))).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncOk1.or(ok2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(err2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(asyncOk2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(asyncErr2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(okRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(errRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(asyncOkRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(asyncErrRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');

    await eua(asyncOk1.or(Promise.resolve(ok2))).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(Promise.resolve(err2))).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(Promise.resolve(asyncOk2))).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(Promise.resolve(asyncErr2))).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(Promise.resolve(okRes2))).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(Promise.resolve(errRes2))).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(Promise.resolve(asyncOkRes2))).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.or(Promise.resolve(asyncErrRes2))).toBe<P<'v1'>, P<never>>(true, 'v1');

    await eua(asyncErr1.or(ok2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.or(err2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.or(asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.or(asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.or(okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.or(errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.or(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.or(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncErr1.or(Promise.resolve(ok2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.or(Promise.resolve(err2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.or(Promise.resolve(asyncOk2))).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.or(Promise.resolve(asyncErr2))).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.or(Promise.resolve(okRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.or(Promise.resolve(errRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.or(Promise.resolve(asyncOkRes2))).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.or(Promise.resolve(asyncErrRes2))).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncOkRes1.or(ok2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.or(err2)).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(asyncOk2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.or(asyncErr2)).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');

    await eua(asyncOkRes1.or(Promise.resolve(ok2))).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.or(Promise.resolve(err2))).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(Promise.resolve(asyncOk2))).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.or(Promise.resolve(asyncErr2))).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(Promise.resolve(okRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(Promise.resolve(errRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.or(Promise.resolve(asyncOkRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(
      true,
      'v1',
    );
    await eua(asyncOkRes1.or(Promise.resolve(asyncErrRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(
      true,
      'v1',
    );

    await eua(asyncErrRes1.or(ok2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v2');
    await eua(asyncErrRes1.or(err2)).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.or(asyncOk2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v2');
    await eua(asyncErrRes1.or(asyncErr2)).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.or(okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErrRes1.or(errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.or(asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErrRes1.or(asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncErrRes1.or(Promise.resolve(ok2))).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v2');
    await eua(asyncErrRes1.or(Promise.resolve(err2))).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.or(Promise.resolve(asyncOk2))).toBe<P<'v1' | 'v2'>, P<never>>(
      true,
      'v2',
    );
    await eua(asyncErrRes1.or(Promise.resolve(asyncErr2))).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.or(Promise.resolve(okRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErrRes1.or(Promise.resolve(errRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.or(Promise.resolve(asyncOkRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(
      true,
      'v2',
    );
    await eua(asyncErrRes1.or(Promise.resolve(asyncErrRes2))).toBe<P<'v1' | 'v2'>, P<'e2'>>(
      false,
      'e2',
    );
  });

  test('andThen', async () => {
    const pOk = async () => await Promise.resolve(ok2);
    const pErr = async () => await Promise.resolve(err2);
    const pAsyncOk = async () => await Promise.resolve(asyncOk2);
    const pAsyncErr = async () => await Promise.resolve(asyncErr2);
    const pOkRes = async () => await Promise.resolve(okRes2);
    const pErrRes = async () => await Promise.resolve(errRes2);
    const pAsyncOkRes = async () => await Promise.resolve(asyncOkRes2);
    const pAsyncErrRes = async () => await Promise.resolve(asyncErrRes2);

    eu(ok1.andThen(() => ok2)).toBe<'v2', never>(true, 'v2');
    eu(ok1.andThen(() => err2)).toBe<never, 'e2'>(false, 'e2');
    await eua(ok1.andThen(() => asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(ok1.andThen(() => asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    eu(ok1.andThen(() => okRes2)).toBe<'v2', 'e2'>(true, 'v2');
    eu(ok1.andThen(() => errRes2)).toBe<'v2', 'e2'>(false, 'e2');
    await eua(ok1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(ok1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(ok1.andThen(pOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(ok1.andThen(pErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(ok1.andThen(pAsyncOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(ok1.andThen(pAsyncErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(ok1.andThen(pOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(ok1.andThen(pErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(ok1.andThen(pAsyncOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(ok1.andThen(pAsyncErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    eu(err1.andThen(() => ok2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(() => err2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(() => asyncOk2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(() => asyncErr2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(() => okRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(() => errRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(() => asyncOkRes2)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(() => asyncErrRes2)).toBe<never, 'e1'>(false, 'e1');

    eu(err1.andThen(pOk)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(pErr)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(pAsyncOk)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(pAsyncErr)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(pOkRes)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(pErrRes)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(pAsyncOkRes)).toBe<never, 'e1'>(false, 'e1');
    eu(err1.andThen(pAsyncErrRes)).toBe<never, 'e1'>(false, 'e1');

    eu(okRes1.andThen(() => ok2)).toBe<'v2', 'e1'>(true, 'v2');
    eu(okRes1.andThen(() => err2)).toBe<never, 'e1' | 'e2'>(false, 'e2');
    await eua(okRes1.andThen(() => asyncOk2)).toBe<P<'v2'>, 'e1' | P<never>>(true, 'v2');
    await eua(okRes1.andThen(() => asyncErr2)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e2');
    eu(okRes1.andThen(() => okRes2)).toBe<'v2', 'e1' | 'e2'>(true, 'v2');
    eu(okRes1.andThen(() => errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e2');
    await eua(okRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2');
    await eua(okRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2');

    await eua(okRes1.andThen(pOk)).toBe<P<'v2'>, 'e1' | P<never>>(true, 'v2');
    await eua(okRes1.andThen(pErr)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e2');
    await eua(okRes1.andThen(pAsyncOk)).toBe<P<'v2'>, 'e1' | P<never>>(true, 'v2');
    await eua(okRes1.andThen(pAsyncErr)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e2');
    await eua(okRes1.andThen(pOkRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2');
    await eua(okRes1.andThen(pErrRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2');
    await eua(okRes1.andThen(pAsyncOkRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2');
    await eua(okRes1.andThen(pAsyncErrRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2');

    eu(errRes1.andThen(() => ok2)).toBe<'v2', 'e1'>(false, 'e1');
    eu(errRes1.andThen(() => err2)).toBe<never, 'e1' | 'e2'>(false, 'e1');
    eu(errRes1.andThen(() => asyncOk2)).toBe<P<'v2'>, 'e1' | P<never>>(false, 'e1');
    eu(errRes1.andThen(() => asyncErr2)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.andThen(() => okRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1');
    eu(errRes1.andThen(() => errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1');
    eu(errRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');

    eu(errRes1.andThen(pOk)).toBe<P<'v2'>, 'e1' | P<never>>(false, 'e1');
    eu(errRes1.andThen(pErr)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.andThen(pAsyncOk)).toBe<P<'v2'>, 'e1' | P<never>>(false, 'e1');
    eu(errRes1.andThen(pAsyncErr)).toBe<P<never>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.andThen(pOkRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.andThen(pErrRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.andThen(pAsyncOkRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');
    eu(errRes1.andThen(pAsyncErrRes)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1');

    await eua(asyncOk1.andThen(() => ok2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.andThen(() => err2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.andThen(() => asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.andThen(() => asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.andThen(() => okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.andThen(() => errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncOk1.andThen(pOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.andThen(pErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.andThen(pAsyncOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncOk1.andThen(pAsyncErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.andThen(pOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.andThen(pErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncOk1.andThen(pAsyncOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncOk1.andThen(pAsyncErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncErr1.andThen(() => ok2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(() => err2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(() => asyncOk2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(() => asyncErr2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(() => okRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(() => errRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(() => asyncOkRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(() => asyncErrRes2)).toBe<P<never>, P<'e1'>>(false, 'e1');

    await eua(asyncErr1.andThen(pOk)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(pErr)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(pAsyncOk)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(pAsyncErr)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(pOkRes)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(pErrRes)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(pAsyncOkRes)).toBe<P<never>, P<'e1'>>(false, 'e1');
    await eua(asyncErr1.andThen(pAsyncErrRes)).toBe<P<never>, P<'e1'>>(false, 'e1');

    await eua(asyncOkRes1.andThen(() => ok2)).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(() => err2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.andThen(() => asyncOk2)).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(() => asyncErr2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.andThen(() => okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(() => errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2');

    await eua(asyncOkRes1.andThen(pOk)).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(pErr)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.andThen(pAsyncOk)).toBe<P<'v2'>, P<'e1'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(pAsyncErr)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.andThen(pOkRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(pErrRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2');
    await eua(asyncOkRes1.andThen(pAsyncOkRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2');
    await eua(asyncOkRes1.andThen(pAsyncErrRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2');

    await eua(asyncErrRes1.andThen(() => ok2)).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(() => err2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(() => asyncOk2)).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(() => asyncErr2)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(() => okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(() => errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');

    await eua(asyncErrRes1.andThen(pOk)).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(pErr)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(pAsyncOk)).toBe<P<'v2'>, P<'e1'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(pAsyncErr)).toBe<P<never>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(pOkRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(pErrRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(pAsyncOkRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
    await eua(asyncErrRes1.andThen(pAsyncErrRes)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1');
  });

  test('orElse', async () => {
    const pOk = async () => await Promise.resolve(ok2);
    const pErr = async () => await Promise.resolve(err2);
    const pAsyncOk = async () => await Promise.resolve(asyncOk2);
    const pAsyncErr = async () => await Promise.resolve(asyncErr2);
    const pOkRes = async () => await Promise.resolve(okRes2);
    const pErrRes = async () => await Promise.resolve(errRes2);
    const pAsyncOkRes = async () => await Promise.resolve(asyncOkRes2);
    const pAsyncErrRes = async () => await Promise.resolve(asyncErrRes2);

    eu(ok1.orElse(() => ok2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(() => err2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(() => asyncOk2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(() => asyncErr2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(() => okRes2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(() => errRes2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(() => asyncOkRes2)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(() => asyncErrRes2)).toBe<'v1', never>(true, 'v1');

    eu(ok1.orElse(pOk)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(pErr)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(pAsyncOk)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(pAsyncErr)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(pOkRes)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(pErrRes)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(pAsyncOkRes)).toBe<'v1', never>(true, 'v1');
    eu(ok1.orElse(pAsyncErrRes)).toBe<'v1', never>(true, 'v1');

    eu(err1.orElse(() => ok2)).toBe<'v2', never>(true, 'v2');
    eu(err1.orElse(() => err2)).toBe<never, 'e2'>(false, 'e2');
    await eua(err1.orElse(() => asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(err1.orElse(() => asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    eu(err1.orElse(() => okRes2)).toBe<'v2', 'e2'>(true, 'v2');
    eu(err1.orElse(() => errRes2)).toBe<'v2', 'e2'>(false, 'e2');
    await eua(err1.orElse(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(err1.orElse(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(err1.orElse(pOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(err1.orElse(pErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(err1.orElse(pAsyncOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(err1.orElse(pAsyncErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(err1.orElse(pOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(err1.orElse(pErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(err1.orElse(pAsyncOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(err1.orElse(pAsyncErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    eu(okRes1.orElse(() => ok2)).toBe<'v1' | 'v2', never>(true, 'v1');
    eu(okRes1.orElse(() => err2)).toBe<'v1', 'e2'>(true, 'v1');
    eu(okRes1.orElse(() => asyncOk2)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v1');
    eu(okRes1.orElse(() => asyncErr2)).toBe<'v1' | P<never>, P<'e2'>>(true, 'v1');
    eu(okRes1.orElse(() => okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1');
    eu(okRes1.orElse(() => errRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1');
    eu(okRes1.orElse(() => asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.orElse(() => asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');

    eu(okRes1.orElse(pOk)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v1');
    eu(okRes1.orElse(pErr)).toBe<'v1' | P<never>, P<'e2'>>(true, 'v1');
    eu(okRes1.orElse(pAsyncOk)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v1');
    eu(okRes1.orElse(pAsyncErr)).toBe<'v1' | P<never>, P<'e2'>>(true, 'v1');
    eu(okRes1.orElse(pOkRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.orElse(pErrRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.orElse(pAsyncOkRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');
    eu(okRes1.orElse(pAsyncErrRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1');

    eu(errRes1.orElse(() => ok2)).toBe<'v1' | 'v2', never>(true, 'v2');
    eu(errRes1.orElse(() => err2)).toBe<'v1', 'e2'>(false, 'e2');
    await eua(errRes1.orElse(() => asyncOk2)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v2');
    await eua(errRes1.orElse(() => asyncErr2)).toBe<'v1' | P<never>, P<'e2'>>(false, 'e2');
    eu(errRes1.orElse(() => okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v2');
    eu(errRes1.orElse(() => errRes2)).toBe<'v1' | 'v2', 'e2'>(false, 'e2');
    await eua(errRes1.orElse(() => asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(errRes1.orElse(() => asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(errRes1.orElse(pOk)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v2');
    await eua(errRes1.orElse(pErr)).toBe<'v1' | P<never>, P<'e2'>>(false, 'e2');
    await eua(errRes1.orElse(pAsyncOk)).toBe<'v1' | P<'v2'>, P<never>>(true, 'v2');
    await eua(errRes1.orElse(pAsyncErr)).toBe<'v1' | P<never>, P<'e2'>>(false, 'e2');
    await eua(errRes1.orElse(pOkRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(errRes1.orElse(pErrRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(errRes1.orElse(pAsyncOkRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(errRes1.orElse(pAsyncErrRes)).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncOk1.orElse(() => ok2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(() => err2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(() => asyncOk2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(() => asyncErr2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(() => okRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(() => errRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(() => asyncOkRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(() => asyncErrRes2)).toBe<P<'v1'>, P<never>>(true, 'v1');

    await eua(asyncOk1.orElse(pOk)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(pErr)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(pAsyncOk)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(pAsyncErr)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(pOkRes)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(pErrRes)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(pAsyncOkRes)).toBe<P<'v1'>, P<never>>(true, 'v1');
    await eua(asyncOk1.orElse(pAsyncErrRes)).toBe<P<'v1'>, P<never>>(true, 'v1');

    await eua(asyncErr1.orElse(() => ok2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.orElse(() => err2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.orElse(() => asyncOk2)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.orElse(() => asyncErr2)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.orElse(() => okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.orElse(() => errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.orElse(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.orElse(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncErr1.orElse(pOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.orElse(pErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.orElse(pAsyncOk)).toBe<P<'v2'>, P<never>>(true, 'v2');
    await eua(asyncErr1.orElse(pAsyncErr)).toBe<P<never>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.orElse(pOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.orElse(pErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErr1.orElse(pAsyncOkRes)).toBe<P<'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErr1.orElse(pAsyncErrRes)).toBe<P<'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncOkRes1.orElse(() => ok2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.orElse(() => err2)).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(() => asyncOk2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.orElse(() => asyncErr2)).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(() => okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(() => errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(() => asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(() => asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');

    await eua(asyncOkRes1.orElse(pOk)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.orElse(pErr)).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(pAsyncOk)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v1');
    await eua(asyncOkRes1.orElse(pAsyncErr)).toBe<P<'v1'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(pOkRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(pErrRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(pAsyncOkRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');
    await eua(asyncOkRes1.orElse(pAsyncErrRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1');

    await eua(asyncErrRes1.orElse(() => ok2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v2');
    await eua(asyncErrRes1.orElse(() => err2)).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.orElse(() => asyncOk2)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v2');
    await eua(asyncErrRes1.orElse(() => asyncErr2)).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.orElse(() => okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErrRes1.orElse(() => errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.orElse(() => asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErrRes1.orElse(() => asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2');

    await eua(asyncErrRes1.orElse(pOk)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v2');
    await eua(asyncErrRes1.orElse(pErr)).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.orElse(pAsyncOk)).toBe<P<'v1' | 'v2'>, P<never>>(true, 'v2');
    await eua(asyncErrRes1.orElse(pAsyncErr)).toBe<P<'v1'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.orElse(pOkRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErrRes1.orElse(pErrRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2');
    await eua(asyncErrRes1.orElse(pAsyncOkRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2');
    await eua(asyncErrRes1.orElse(pAsyncErrRes)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2');
  });

  test('match', async () => {
    const mismatchedTypesMatch = { ok: () => 42 as const, err: () => true as const };
    type OkMismatch = ReturnType<(typeof mismatchedTypesMatch)['ok']>;
    type ErrMismatch = ReturnType<(typeof mismatchedTypesMatch)['err']>;

    const okMismatch = okVal.match(mismatchedTypesMatch);
    expectTypeOf(okMismatch).toEqualTypeOf<OkMismatch>();

    const errMismatch = errVal.match(mismatchedTypesMatch);
    expectTypeOf(errMismatch).toEqualTypeOf<ErrMismatch>();

    const asyncOkMismatch = asyncOkVal.match(mismatchedTypesMatch);
    expectTypeOf(asyncOkMismatch).toEqualTypeOf<P<OkMismatch>>();

    const asyncErrMismatch = asyncErrVal.match(mismatchedTypesMatch);
    expectTypeOf(asyncErrMismatch).toEqualTypeOf<P<ErrMismatch>>();

    const okResMismatch = okResVal.match(mismatchedTypesMatch);
    expectTypeOf(okResMismatch).toEqualTypeOf<OkMismatch | ErrMismatch>();

    const errResMismatch = errResVal.match(mismatchedTypesMatch);
    expectTypeOf(errResMismatch).toEqualTypeOf<OkMismatch | ErrMismatch>();

    const asyncOkResMismatch = asyncOkResVal.match(mismatchedTypesMatch);
    expectTypeOf(asyncOkResMismatch).toEqualTypeOf<P<OkMismatch | ErrMismatch>>();

    const asyncErrResMismatch = asyncErrResVal.match(mismatchedTypesMatch);
    expectTypeOf(asyncErrResMismatch).toEqualTypeOf<P<OkMismatch | ErrMismatch>>();

    const okValMock = vi.fn();
    const okMatch = okVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        expect(value).toBe('value');
        okValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<never>();
        expect(false).toBe(true);
        okValMock(error);
        return error;
      },
    });
    expect(okValMock).toHaveBeenCalledTimes(1);
    expect(okValMock).toBeCalledWith('value');
    expectTypeOf(okMatch).toEqualTypeOf<'value'>();
    expect(okMatch).toBe('value');

    const errValMock = vi.fn();
    const errMatch = errVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<never>();
        expect(false).toBe(true);
        errValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'error'>();
        expect(error).toBe('error');
        errValMock(error);
        return error;
      },
    });
    expect(errValMock).toHaveBeenCalledTimes(1);
    expect(errValMock).toBeCalledWith('error');
    expectTypeOf(errMatch).toEqualTypeOf<'error'>();
    expect(errMatch).toBe('error');

    const asyncOkValMock = vi.fn();
    const asyncOkMatch = asyncOkVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        expect(value).toBe('value');
        asyncOkValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<never>();
        expect(false).toBe(true);
        asyncOkValMock(error);
        return error;
      },
    });
    await expect(asyncOkMatch).resolves.toBe('value');
    expect(asyncOkValMock).toHaveBeenCalledTimes(1);
    expect(asyncOkValMock).toBeCalledWith('value');
    expectTypeOf(asyncOkMatch).toEqualTypeOf<P<'value'>>();

    const asyncErrValMock = vi.fn();
    const asyncErrMatch = asyncErrVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<never>();
        expect(false).toBe(true);
        asyncErrValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'error'>();
        expect(error).toBe('error');
        asyncErrValMock(error);
        return error;
      },
    });
    await expect(asyncErrMatch).resolves.toBe('error');
    expect(asyncErrValMock).toHaveBeenCalledTimes(1);
    expect(asyncErrValMock).toBeCalledWith('error');
    expectTypeOf(asyncErrMatch).toEqualTypeOf<P<'error'>>();

    const okResValMock = vi.fn();
    const okResMatch = okResVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        expect(value).toBe('value');
        okResValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<unknown>();
        expect(false).toBe(true);
        okResValMock(error);
        return error;
      },
    });
    expect(okResValMock).toHaveBeenCalledTimes(1);
    expect(okResValMock).toBeCalledWith('value');
    expectTypeOf(okResMatch).toEqualTypeOf<'value' | unknown>();
    expect(okResMatch).toBe('value');

    const errResValMock = vi.fn();
    const errResMatch = errResVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        expect(false).toBe(true);
        errResValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<unknown>();
        expect(error).toBe(error);
        errResValMock(error);
        return error;
      },
    });
    expect(errResValMock).toHaveBeenCalledTimes(1);
    expect(errResValMock).toBeCalledWith(error);
    expectTypeOf(errResMatch).toEqualTypeOf<'value' | unknown>();
    expect(errResMatch).toBe(error);

    const asyncOkResValMock = vi.fn();
    const asyncOkResMatch = asyncOkResVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        expect(value).toBe('value');
        asyncOkResValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<unknown>();
        expect(false).toBe(true);
        asyncOkResValMock(error);
        return error;
      },
    });
    await expect(asyncOkResMatch).resolves.toBe('value');
    expect(asyncOkResValMock).toHaveBeenCalledTimes(1);
    expect(asyncOkResValMock).toBeCalledWith('value');
    expectTypeOf(asyncOkResMatch).toEqualTypeOf<P<'value' | unknown>>();

    const asyncErrResValMock = vi.fn();
    const asyncErrResMatch = asyncErrResVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        expect(false).toBe(true);
        asyncErrResValMock(value);
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<unknown>();
        expect(error).toBe(error);
        asyncErrResValMock(error);
        return error;
      },
    });
    await expect(asyncErrResMatch).resolves.toBe(error);
    expect(asyncErrResValMock).toHaveBeenCalledTimes(1);
    expect(asyncErrResValMock).toBeCalledWith(error);
    expectTypeOf(asyncErrResMatch).toEqualTypeOf<P<'value' | unknown>>();
  });

  test('serialize', async () => {
    type ResSerialized = { type: 'ok'; value: 'value' } | { type: 'err'; error: unknown };

    const okSerialized = okVal.serialize();
    expectTypeOf(okSerialized).toEqualTypeOf<{ type: 'ok'; value: 'value' }>();
    expect(okSerialized).toEqual({ type: 'ok', value: 'value' });
    const okParsed = resultFromSerialized(okSerialized);
    eu(okParsed).toBe<'value', never>(true, 'value');

    const errSerialized = errVal.serialize();
    expectTypeOf(errSerialized).toEqualTypeOf<{ type: 'err'; error: 'error' }>();
    expect(errSerialized).toEqual({ type: 'err', error: 'error' });
    const errParsed = resultFromSerialized(errSerialized);
    eu(errParsed).toBe<never, 'error'>(false, 'error');

    const okResSerialized = okResVal.serialize();
    expectTypeOf(okResSerialized).toEqualTypeOf<ResSerialized>();
    expect(okResSerialized).toEqual({ type: 'ok', value: 'value' });
    const okResParsed = resultFromSerialized(okResSerialized);
    eu(okResParsed).toBe<'value', unknown>(true, 'value');

    const errResSerialized = errResVal.serialize();
    expectTypeOf(errResSerialized).toEqualTypeOf<ResSerialized>();
    expect(errResSerialized).toEqual({ type: 'err', error });
    const errResParsed = resultFromSerialized(errResSerialized);
    eu(errResParsed).toBe<'value', unknown>(false, error);

    const asyncOkSerialized = asyncOkVal.serialize();
    expectTypeOf(asyncOkSerialized).toEqualTypeOf<P<{ type: 'ok'; value: 'value' }>>();
    await expect(asyncOkSerialized).resolves.toEqual({ type: 'ok', value: 'value' });
    const asyncOkParsed = asyncResultFromSerialized(asyncOkSerialized);
    await eua(asyncOkParsed).toBe<P<'value'>, P<never>>(true, 'value');

    const asyncErrSerialized = asyncErrVal.serialize();
    expectTypeOf(asyncErrSerialized).toEqualTypeOf<P<{ type: 'err'; error: 'error' }>>();
    await expect(asyncErrSerialized).resolves.toEqual({ type: 'err', error: 'error' });
    const asyncErrParsed = asyncResultFromSerialized(asyncErrSerialized);
    await eua(asyncErrParsed).toBe<P<never>, P<'error'>>(false, 'error');

    const asyncOkResSerialized = asyncOkResVal.serialize();
    expectTypeOf(asyncOkResSerialized).toEqualTypeOf<P<ResSerialized>>();
    await expect(asyncOkResSerialized).resolves.toEqual({ type: 'ok', value: 'value' });
    const asyncOkResParsed = asyncResultFromSerialized(asyncOkResSerialized);
    await eua(asyncOkResParsed).toBe<P<'value'>, P<unknown>>(true, 'value');

    const asyncErrResSerialized = asyncErrResVal.serialize();
    expectTypeOf(asyncErrResSerialized).toEqualTypeOf<P<ResSerialized>>();
    await expect(asyncErrResSerialized).resolves.toEqual({ type: 'err', error });
    const asyncErrResParsed = asyncResultFromSerialized(asyncErrResSerialized);
    await eua(asyncErrResParsed).toBe<P<'value'>, P<unknown>>(false, error);
  });
});
