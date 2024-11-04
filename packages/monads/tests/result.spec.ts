import { describe, expect, expectTypeOf, it } from 'vitest';
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
      unwrappedValue: Awaited<TUnwrap | TUnwrapErr>,
    ) => {
      if (isOk) expect(result.unwrap()).toStrictEqual(unwrappedValue);
      else expect(result.unwrapErr()).toStrictEqual(unwrappedValue);
    },
  };
}

function expectUnwrapAsync<TResult extends AnyAsyncResult>(result: TResult) {
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
      unwrappedValue: Awaited<TUnwrap | TUnwrapErr>,
    ) => {
      if (isOk) expect(result.unwrap()).resolves.toStrictEqual(unwrappedValue);
      else expect(result.unwrapErr()).resolves.toStrictEqual(unwrappedValue);
    },
  };
}

type P<TValue> = Promise<TValue>;

describe('Result', () => {
  it('should have type-safe `isOk` and `isErr` properties', async () => {});

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

    expectUnwrapAsync(asyncOkResVal).toBe<P<'value'>, P<unknown>>(true, 'value');
    if (await asyncOkResVal.isOk) {
      // TODO make this also work for AsyncResult
      // expectUnwrapAsync(asyncOkResVal).toBe<P<'value'>, P<never>>(true, 'value');
    } else {
      // expectUnwrapAsync(asyncOkResVal).toBe<P<never>, P<unknown>>(true, 'value');
    }
  });
});
