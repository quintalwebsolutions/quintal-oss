import { type Mock, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  type AnyOption,
  type AnyResult,
  type AsyncResult,
  type Err,
  type Ok,
  type Result,
  asyncErr,
  asyncOk,
  asyncResult,
  err,
  ok,
  result,
} from '../src';
import { type None, type Option, type Some, none, some } from '../src';
import type { AsyncErr, AsyncOk } from '../src';
import type { And, Equal, MaybePromise, Ternary } from './util';

function expectU<Result extends AnyResult>(result: Result) {
  return {
    toBe: async <Unwrap, UnwrapErr>(
      isOk: Ternary<
        And<
          Equal<ReturnType<Result['unwrap']>, Unwrap>,
          Equal<ReturnType<Result['unwrapErr']>, UnwrapErr>
        >,
        boolean,
        never
      >,
      unwrappedValue: Awaited<Unwrap | UnwrapErr>,
    ) => {
      if (isOk) expect(await result.unwrap()).toStrictEqual(unwrappedValue);
      else expect(await result.unwrapErr()).toStrictEqual(unwrappedValue);
    },
  };
}

function returns(): 'value' {
  return 'value';
}

function throws(): 'value' {
  throw new Error('error');
}

// biome-ignore lint/nursery/useAwait: test
async function returnsAsync(): P<'value'> {
  return 'value';
}

// biome-ignore lint/nursery/useAwait: test
async function throwsAsync(): P<'value'> {
  throw new Error('error');
}

type P<T> = Promise<T>;

const okVal = ok('value' as const);
const asyncOkVal = asyncOk('value' as const);
const errVal = err('error' as const);
const asyncErrVal = asyncErr('error' as const);

const earlyOk = ok('early' as const);
const earlyErr = err('early' as const);
const asyncEarlyOk = asyncOk('early' as const);
const asyncEarlyErr = asyncErr('early' as const);

const lateOk = ok('late' as const);
const lateErr = err('late' as const);
const asyncLateOk = asyncOk('late' as const);
const asyncLateErr = asyncErr('late' as const);

const okRes1 = ok('v1') as Result<'v1', 'e1'>;
const okRes2 = ok('v2') as Result<'v2', 'e2'>;
const errRes1 = err('e1') as Result<'v1', 'e1'>;
const errRes2 = err('e2') as Result<'v2', 'e2'>;
const asyncOkRes1 = asyncOk('v1') as AsyncResult<Result<'v1', 'e1'>>;
const asyncOkRes2 = asyncOk('v2') as AsyncResult<Result<'v2', 'e2'>>;
const asyncErrRes1 = asyncErr('e1') as AsyncResult<Result<'v1', 'e1'>>;
const asyncErrRes2 = asyncErr('e2') as AsyncResult<Result<'v2', 'e2'>>;

const okResVal = result(returns);
const errResVal = result(throws);
const asyncOkResVal = asyncResult(returnsAsync);
const asyncErrResVal = asyncResult(throwsAsync);

type ResVal = typeof okResVal;
type AsyncResVal = typeof asyncOkResVal;

describe('Result', () => {
  it('should have type-safe `ok` and `err` properties', async () => {
    function expectIsOkIsErr<TResult extends AnyResult>(result: TResult) {
      return {
        toBe: async <
          TIsOk,
          TIsErr,
          TIsEqual extends boolean = And<
            Equal<TIsOk, TResult['isOk']>,
            Equal<TIsErr, TResult['isErr']>
          >,
        >(
          isOk: Ternary<TIsEqual, Awaited<TIsOk>, never>,
          isErr: Ternary<TIsEqual, Awaited<TIsErr>, never>,
        ) => {
          // TODO how to add context to this so that if it fails, we know under which circumstances it failed?
          expect(await result.isOk).toBe(isOk);
          expect(await result.isErr).toBe(isErr);
        },
      };
    }

    await Promise.all([
      expectIsOkIsErr(okVal).toBe<true, false>(true, false),
      expectIsOkIsErr(errVal).toBe<false, true>(false, true),
      expectIsOkIsErr(okResVal).toBe<boolean, boolean>(true, false),
      expectIsOkIsErr(errResVal).toBe<boolean, boolean>(false, true),
      expectIsOkIsErr(asyncOkVal).toBe<P<true>, P<false>>(true, false),
      expectIsOkIsErr(asyncErrVal).toBe<P<false>, P<true>>(false, true),
      expectIsOkIsErr(asyncOkResVal).toBe<P<boolean>, P<boolean>>(true, false),
      expectIsOkIsErr(asyncErrResVal).toBe<P<boolean>, P<boolean>>(false, true),
    ]);
  });

  it('should type-narrow based on `isOk` and `isErr` checks', () => {
    // TODO is this possible for AsyncResult?
    expectU(okResVal).toBe<'value', unknown>(true, 'value');
    expectTypeOf(okResVal).not.toHaveProperty('value');
    expectTypeOf(okResVal).not.toHaveProperty('error');

    if (okResVal.isOk) {
      expectU(okResVal).toBe<'value', never>(true, 'value');
      expectTypeOf(okResVal).toHaveProperty('value');
      expectTypeOf(okResVal).not.toHaveProperty('error');
    } else {
      expectU(okResVal).toBe<never, unknown>(true, 'value');
      expectTypeOf(okResVal).not.toHaveProperty('value');
      expectTypeOf(okResVal).toHaveProperty('error');
    }
  });

  it('should validate `ok` and `err` values against sync and async predicats with `isOkAnd` and `isErrAnd`', async () => {
    function expectPredicate<TBool extends MaybePromise<boolean>>(bool: TBool) {
      return {
        toBe: async <T>(value: Ternary<Equal<T, TBool>, Awaited<T>, never>) =>
          expect(await bool).toBe(value),
      };
    }

    const pTrue = () => true as const;
    const pFalse = () => false as const;
    const pAsyncTrue = async () => true as const;
    const pAsyncFalse = async () => false as const;

    await Promise.all([
      expectPredicate(okVal.isOkAnd(pTrue)).toBe<true>(true),
      expectPredicate(okVal.isOkAnd(pFalse)).toBe<false>(false),
      expectPredicate(okVal.isOkAnd(pAsyncTrue)).toBe<P<true>>(true),
      expectPredicate(okVal.isOkAnd(pAsyncFalse)).toBe<P<false>>(false),
      expectPredicate(asyncOkVal.isOkAnd(pTrue)).toBe<P<true>>(true),
      expectPredicate(asyncOkVal.isOkAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncOkVal.isOkAnd(pAsyncTrue)).toBe<P<true>>(true),
      expectPredicate(asyncOkVal.isOkAnd(pAsyncFalse)).toBe<P<false>>(false),

      expectPredicate(errVal.isOkAnd(pTrue)).toBe<false>(false),
      expectPredicate(errVal.isOkAnd(pFalse)).toBe<false>(false),
      expectPredicate(errVal.isOkAnd(pAsyncTrue)).toBe<false>(false),
      expectPredicate(errVal.isOkAnd(pAsyncFalse)).toBe<false>(false),
      expectPredicate(asyncErrVal.isOkAnd(pTrue)).toBe<P<false>>(false),
      expectPredicate(asyncErrVal.isOkAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncErrVal.isOkAnd(pAsyncTrue)).toBe<P<false>>(false),
      expectPredicate(asyncErrVal.isOkAnd(pAsyncFalse)).toBe<P<false>>(false),

      expectPredicate(okResVal.isOkAnd(pTrue)).toBe<boolean>(true),
      expectPredicate(okResVal.isOkAnd(pFalse)).toBe<false>(false),
      expectPredicate(okResVal.isOkAnd(pAsyncTrue)).toBe<false | P<true>>(true),
      expectPredicate(okResVal.isOkAnd(pAsyncFalse)).toBe<false | P<false>>(false),
      expectPredicate(asyncOkResVal.isOkAnd(pTrue)).toBe<P<boolean>>(true),
      expectPredicate(asyncOkResVal.isOkAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncOkResVal.isOkAnd(pAsyncTrue)).toBe<P<boolean>>(true),
      expectPredicate(asyncOkResVal.isOkAnd(pAsyncFalse)).toBe<P<false>>(false),

      expectPredicate(errResVal.isOkAnd(pTrue)).toBe<boolean>(false),
      expectPredicate(errResVal.isOkAnd(pFalse)).toBe<false>(false),
      expectPredicate(errResVal.isOkAnd(pAsyncTrue)).toBe<false | P<true>>(false),
      expectPredicate(errResVal.isOkAnd(pAsyncFalse)).toBe<false | P<false>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pTrue)).toBe<P<boolean>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pAsyncTrue)).toBe<P<boolean>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pAsyncFalse)).toBe<P<false>>(false),

      expectPredicate(okVal.isErrAnd(pTrue)).toBe<false>(false),
      expectPredicate(okVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(okVal.isErrAnd(pAsyncTrue)).toBe<false>(false),
      expectPredicate(okVal.isErrAnd(pAsyncFalse)).toBe<false>(false),
      expectPredicate(asyncOkVal.isErrAnd(pTrue)).toBe<P<false>>(false),
      expectPredicate(asyncOkVal.isErrAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncOkVal.isErrAnd(pAsyncTrue)).toBe<P<false>>(false),
      expectPredicate(asyncOkVal.isErrAnd(pAsyncFalse)).toBe<P<false>>(false),

      expectPredicate(errVal.isErrAnd(pTrue)).toBe<true>(true),
      expectPredicate(errVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(errVal.isErrAnd(pAsyncTrue)).toBe<P<true>>(true),
      expectPredicate(errVal.isErrAnd(pAsyncFalse)).toBe<P<false>>(false),
      expectPredicate(asyncErrVal.isErrAnd(pTrue)).toBe<P<true>>(true),
      expectPredicate(asyncErrVal.isErrAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncErrVal.isErrAnd(pAsyncTrue)).toBe<P<true>>(true),
      expectPredicate(asyncErrVal.isErrAnd(pAsyncFalse)).toBe<P<false>>(false),

      expectPredicate(okResVal.isErrAnd(pTrue)).toBe<boolean>(false),
      expectPredicate(okResVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(okResVal.isErrAnd(pAsyncTrue)).toBe<false | P<true>>(false),
      expectPredicate(okResVal.isErrAnd(pAsyncFalse)).toBe<false | P<false>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pTrue)).toBe<P<boolean>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pAsyncTrue)).toBe<P<boolean>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pAsyncFalse)).toBe<P<false>>(false),

      expectPredicate(errResVal.isErrAnd(pTrue)).toBe<boolean>(true),
      expectPredicate(errResVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(errResVal.isErrAnd(pAsyncTrue)).toBe<false | P<true>>(true),
      expectPredicate(errResVal.isErrAnd(pAsyncFalse)).toBe<false | P<false>>(false),
      expectPredicate(asyncErrResVal.isErrAnd(pTrue)).toBe<P<boolean>>(true),
      expectPredicate(asyncErrResVal.isErrAnd(pFalse)).toBe<P<false>>(false),
      expectPredicate(asyncErrResVal.isErrAnd(pAsyncTrue)).toBe<P<boolean>>(true),
      expectPredicate(asyncErrResVal.isErrAnd(pAsyncFalse)).toBe<P<false>>(false),
    ]);
  });

  it('should facilitate inspection of `ok` and `err` values with `inspect` and `inspectErr`', async () => {
    function expectInspect<TResult extends AnyResult>(result: TResult) {
      return {
        toBe: async <
          TInspect,
          TInspectErr,
          TIsEqual extends boolean = And<
            Equal<TInspect, Parameters<Parameters<TResult['inspect']>[0]>[0]>,
            Equal<TInspectErr, Parameters<Parameters<TResult['inspectErr']>[0]>[0]>
          >,
        >(
          isOk: Ternary<TIsEqual, boolean, never>,
          isAsync: Ternary<TIsEqual, boolean, never>,
          value: Ternary<TIsEqual, unknown, never>,
        ) => {
          async function test(
            inspectOk: boolean,
            getResult: (mock: Mock) => AnyResult,
          ): Promise<void> {
            const mock = vi.fn();
            const result = getResult(mock);
            if (isAsync) {
              expect(mock).toHaveBeenCalledTimes(0);
              await result;
            }
            expect(mock).toHaveBeenCalledTimes((isOk && inspectOk) || !(isOk || inspectOk) ? 1 : 0);
          }

          await Promise.all([
            test(true, (mock) =>
              result.inspect((v) => {
                expect(v).toStrictEqual(value);
                mock();
              }),
            ),
            test(true, (mock) =>
              // biome-ignore lint/nursery/useAwait: test
              result.inspect(async (v) => {
                expect(v).toStrictEqual(value);
                mock();
              }),
            ),
            test(false, (mock) =>
              result.inspectErr((e) => {
                expect(e).toStrictEqual(value);
                mock();
              }),
            ),
            test(false, (mock) =>
              // biome-ignore lint/nursery/useAwait: test
              result.inspectErr(async (e) => {
                expect(e).toStrictEqual(value);
                mock();
              }),
            ),
          ]);
        },
      };
    }

    await Promise.all([
      expectInspect(okVal).toBe<'value', never>(true, false, 'value'),
      expectInspect(errVal).toBe<never, 'error'>(false, false, 'error'),
      expectInspect(okResVal).toBe<'value', unknown>(true, false, 'value'),
      expectInspect(errResVal).toBe<'value', unknown>(false, false, Error('error')),
      expectInspect(asyncOkVal).toBe<'value', never>(true, true, 'value'),
      expectInspect(asyncErrVal).toBe<never, 'error'>(false, true, 'error'),
      expectInspect(asyncOkResVal).toBe<'value', unknown>(true, true, 'value'),
      expectInspect(asyncErrResVal).toBe<'value', unknown>(false, true, Error('error')),
    ]);
  });

  it('should unwrap the contained value or throw a custom error with `expect` and `expectErr`', async () => {
    const expectMsg = 'Should be ok';
    const exepctErrMsg = 'Should be error';

    expect(okVal.expect(expectMsg)).toBe('value');
    expect(() => okVal.expectErr(exepctErrMsg)).toThrow(exepctErrMsg);

    expect(() => errVal.expect(expectMsg)).toThrow(expectMsg);
    expect(errVal.expectErr(exepctErrMsg)).toBe('error');

    expect(okResVal.expect(expectMsg)).toBe('value');
    expect(() => okResVal.expectErr(exepctErrMsg)).toThrow(exepctErrMsg);

    expect(() => errResVal.expect(expectMsg)).toThrow(expectMsg);
    expect(errResVal.expectErr(exepctErrMsg)).toStrictEqual(Error('error'));

    expect(await asyncOkVal.expect(expectMsg)).toBe('value');
    expect(() => asyncOkVal.expectErr(exepctErrMsg)).rejects.toThrow(exepctErrMsg);

    expect(() => asyncErrVal.expect(expectMsg)).rejects.toThrow(expectMsg);
    expect(await asyncErrVal.expectErr(exepctErrMsg)).toBe('error');

    expect(await asyncOkResVal.expect(expectMsg)).toBe('value');
    expect(() => asyncOkResVal.expectErr(exepctErrMsg)).rejects.toThrow(exepctErrMsg);

    expect(() => asyncErrResVal.expect(expectMsg)).rejects.toThrow(expectMsg);
    expect(await asyncErrResVal.expectErr(exepctErrMsg)).toStrictEqual(Error('error'));
  });

  it('should unwrap the contained `ok` value and throw on `err` with `unwrap` and `unwrapErr`', async () => {
    expectU(okVal).toBe<'value', never>(true, 'value');
    expect(okVal.unwrap()).toBe('value');
    expect(() => okVal.unwrapErr()).toThrow("Attempted to unwrapErr an 'ok' value: value");

    expectU(errVal).toBe<never, 'error'>(false, 'error');
    expect(() => errVal.unwrap()).toThrow('error');
    expect(errVal.unwrapErr()).toBe('error');

    expectU(okResVal).toBe<'value', unknown>(true, 'value');
    expect(okResVal.unwrap()).toBe('value');
    expect(() => okResVal.unwrapErr()).toThrow("Attempted to unwrapErr an 'ok' value: value");

    expectU(errResVal).toBe<'value', unknown>(false, Error('error'));
    expect(() => errResVal.unwrap()).toThrow('error');
    expect(errResVal.unwrapErr()).toStrictEqual(Error('error'));

    expectU(asyncOkVal).toBe<P<'value'>, P<never>>(true, 'value');
    expect(await asyncOkVal.unwrap()).toBe('value');
    expect(() => asyncOkVal.unwrapErr()).rejects.toThrow(
      "Attempted to unwrapErr an 'ok' value: value",
    );

    expectU(asyncErrVal).toBe<P<never>, P<'error'>>(false, 'error');
    expect(() => asyncErrVal.unwrap()).rejects.toThrow('error');
    expect(await asyncErrVal.unwrapErr()).toBe('error');

    expectU(asyncOkResVal).toBe<P<'value'>, P<unknown>>(true, 'value');
    expect(await asyncOkResVal.unwrap()).toBe('value');
    expect(() => asyncOkResVal.unwrapErr()).rejects.toThrow(
      "Attempted to unwrapErr an 'ok' value: value",
    );

    expectU(asyncErrResVal).toBe<P<'value'>, P<unknown>>(false, Error('error'));
    expect(() => asyncErrResVal.unwrap()).rejects.toThrow('error');
    expect(await asyncErrResVal.unwrapErr()).toStrictEqual(Error('error'));
  });

  it('should unwrap the contained value or return a default with `unwrapOr` and `unwrapOrElse`', async () => {
    const dfVal = 'default' as const;
    const aDfVal = Promise.resolve(dfVal);
    const dfFn = () => dfVal;
    const aDfFn = () => aDfVal;

    function expectUnwrap<T>(value: T) {
      return {
        toBe: async <TValue>(expectValue: Ternary<Equal<T, TValue>, Awaited<T>, never>) => {
          expect(await value).toBe(expectValue);
        },
      };
    }

    await Promise.all([
      expectUnwrap(okVal.unwrapOr(dfVal)).toBe<'value'>('value'),
      expectUnwrap(okVal.unwrapOr(aDfVal)).toBe<'value'>('value'),
      expectUnwrap(okVal.unwrapOrElse(dfFn)).toBe<'value'>('value'),
      expectUnwrap(okVal.unwrapOrElse(aDfFn)).toBe<'value'>('value'),
      expectUnwrap(asyncOkVal.unwrapOr(dfVal)).toBe<P<'value'>>('value'),
      expectUnwrap(asyncOkVal.unwrapOr(aDfVal)).toBe<P<'value'>>('value'),
      expectUnwrap(asyncOkVal.unwrapOrElse(dfFn)).toBe<P<'value'>>('value'),
      expectUnwrap(asyncOkVal.unwrapOrElse(aDfFn)).toBe<P<'value'>>('value'),

      expectUnwrap(errVal.unwrapOr(dfVal)).toBe<'default'>('default'),
      expectUnwrap(errVal.unwrapOr(aDfVal)).toBe<P<'default'>>('default'),
      expectUnwrap(errVal.unwrapOrElse(dfFn)).toBe<'default'>('default'),
      expectUnwrap(errVal.unwrapOrElse(aDfFn)).toBe<P<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOr(dfVal)).toBe<P<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOr(aDfVal)).toBe<P<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOrElse(dfFn)).toBe<P<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOrElse(aDfFn)).toBe<P<'default'>>('default'),

      expectUnwrap(okResVal.unwrapOr(dfVal)).toBe<'value' | 'default'>('value'),
      expectUnwrap(okResVal.unwrapOr(aDfVal)).toBe<'value' | P<'default'>>('value'),
      expectUnwrap(okResVal.unwrapOrElse(dfFn)).toBe<'value' | 'default'>('value'),
      expectUnwrap(okResVal.unwrapOrElse(aDfFn)).toBe<'value' | P<'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOr(dfVal)).toBe<P<'value' | 'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOr(aDfVal)).toBe<P<'value' | 'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOrElse(dfFn)).toBe<P<'value' | 'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOrElse(aDfFn)).toBe<P<'value' | 'default'>>('value'),

      expectUnwrap(errResVal.unwrapOr(dfVal)).toBe<'value' | 'default'>('default'),
      expectUnwrap(errResVal.unwrapOr(aDfVal)).toBe<'value' | P<'default'>>('default'),
      expectUnwrap(errResVal.unwrapOrElse(dfFn)).toBe<'value' | 'default'>('default'),
      expectUnwrap(errResVal.unwrapOrElse(aDfFn)).toBe<'value' | P<'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOr(dfVal)).toBe<P<'value' | 'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOr(aDfVal)).toBe<P<'value' | 'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOrElse(dfFn)).toBe<P<'value' | 'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOrElse(aDfFn)).toBe<P<'value' | 'default'>>('default'),
    ]);
  });

  it('should convert to respective `Option` types using `ok` and `err`', async () => {
    function expectOkErr<TResult extends AnyResult>(result: TResult) {
      return {
        toBe: async <TOk extends MaybePromise<AnyOption>, TErr extends MaybePromise<AnyOption>>(
          isOk: Ternary<
            And<Equal<TOk, ReturnType<TResult['ok']>>, Equal<TErr, ReturnType<TResult['err']>>>,
            boolean,
            never
          >,
          value: ReturnType<Awaited<TOk | TErr>['unwrap']>,
        ) => {
          const o = await result.ok();
          expect(o.isSome).toBe(isOk);
          expect(o.isNone).toBe(!isOk);
          if (isOk) expect(o.unwrap()).toStrictEqual(value);
          else expect(o.unwrap).toThrow();

          const e = await result.err();
          expect(e.isSome).toBe(!isOk);
          expect(e.isNone).toBe(isOk);
          if (isOk) expect(e.unwrap).toThrow();
          else expect(e.unwrap()).toStrictEqual(value);
        },
      };
    }

    await Promise.all([
      expectOkErr(okVal).toBe<Some<'value'>, None>(true, 'value'),
      expectOkErr(errVal).toBe<None, Some<'error'>>(false, 'error'),
      expectOkErr(okResVal).toBe<Option<'value'>, Option<unknown>>(true, 'value'),
      expectOkErr(errResVal).toBe<Option<'value'>, Option<unknown>>(false, Error('error')),
      // TODO AsyncOption
      expectOkErr(asyncOkVal).toBe<P<Some<'value'>>, P<None>>(true, 'value'),
      expectOkErr(asyncErrVal).toBe<P<None>, P<Some<'error'>>>(false, 'error'),
      expectOkErr(asyncOkResVal).toBe<P<Option<'value'>>, P<Option<unknown>>>(true, 'value'),
      expectOkErr(asyncErrResVal).toBe<P<Option<'value'>>, P<Option<unknown>>>(
        false,
        Error('error'),
      ),
    ]);
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

    const asyncOkNone = asyncOk(none).transpose();
    expectTypeOf(asyncOkNone).toEqualTypeOf<Promise<None>>(); // TODO AsyncNone
    // expect(asyncOkNone.isNone).resolves.toBe(true);

    const asyncOkSome = asyncOk(some('value' as const)).transpose();
    expectTypeOf(asyncOkSome).toEqualTypeOf<Promise<Some<Ok<'value'>>>>(); // TODO AsyncSome
    // expect(asyncOkSome.isSome).resolves.toBe(true);

    const asyncOkTransposed = asyncOkVal.transpose();
    expectTypeOf(asyncOkTransposed).toEqualTypeOf<Promise<Some<Ok<'value'>>>>(); // TODO AsyncSome
    // expect(asyncOkSome.isSome).resolves.toBe(true);

    const asyncErrNone = asyncErr(none).transpose();
    expectTypeOf(asyncErrNone).toEqualTypeOf<Promise<Some<Err<None>>>>(); // TODO AsyncSome
    // expect(asyncErrNone.isSome).resolves.toBe(true);

    const asyncErrSome = asyncErr(some('value' as const)).transpose();
    expectTypeOf(asyncErrSome).toEqualTypeOf<Promise<Some<Err<Some<'value'>>>>>(); // TODO AsyncSome
    // expect(asyncErrSome.isSome).resolves.toBe(true);

    const asyncErrTransposed = asyncErrVal.transpose();
    expectTypeOf(asyncErrTransposed).toEqualTypeOf<Promise<Some<Err<'error'>>>>(); // TODO AsyncSome
    // expect(asyncErrTransposed.isSome).resolves.toBe(true);
  });

  it('should flatten a `Result` for at most one level', async () => {
    await Promise.all([
      expectU(okVal.flatten()).toBe<'value', never>(true, 'value'),
      expectU(ok(okVal).flatten()).toBe<'value', never>(true, 'value'),
      expectU(err(okVal).flatten()).toBe<never, Ok<'value'>>(false, okVal),
      expectU(asyncOk(okVal).flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
      expectU(asyncErr(okVal).flatten()).toBe<P<never>, P<Ok<'value'>>>(false, okVal),

      expectU(errVal.flatten()).toBe<never, 'error'>(false, 'error'),
      expectU(ok(errVal).flatten()).toBe<never, 'error'>(false, 'error'),
      expectU(err(errVal).flatten()).toBe<never, Err<'error'>>(false, errVal),
      expectU(asyncOk(errVal).flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
      expectU(asyncErr(errVal).flatten()).toBe<P<never>, P<Err<'error'>>>(false, errVal),

      expectU(asyncOkVal.flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
      expectU(ok(asyncOkVal).flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
      expectU(err(asyncOkVal).flatten()).toBe<never, AsyncOk<'value'>>(false, okVal),
      expectU(asyncOk(asyncOkVal).flatten()).toBe<P<'value'>, P<never>>(true, 'value'),
      expectU(asyncErr(asyncOkVal).flatten()).toBe<P<never>, P<Ok<'value'>>>(false, okVal),

      expectU(asyncErrVal.flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
      expectU(ok(asyncErrVal).flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
      expectU(err(asyncErrVal).flatten()).toBe<never, AsyncErr<'error'>>(false, errVal),
      expectU(asyncOk(asyncErrVal).flatten()).toBe<P<never>, P<'error'>>(false, 'error'),
      expectU(asyncErr(asyncErrVal).flatten()).toBe<P<never>, P<Err<'error'>>>(false, errVal),

      expectU(okResVal.flatten()).toBe<'value', unknown>(true, 'value'),
      expectU(ok(okResVal).flatten()).toBe<'value', unknown>(true, 'value'),
      expectU(err(okResVal).flatten()).toBe<never, ResVal>(false, okResVal),
      expectU(asyncOk(okResVal).flatten()).toBe<P<'value'>, P<unknown>>(true, 'value'),
      expectU(asyncErr(okResVal).flatten()).toBe<P<never>, P<ResVal>>(false, okVal),

      expectU(errResVal.flatten()).toBe<'value', unknown>(false, Error('error')),
      expectU(ok(errResVal).flatten()).toBe<'value', unknown>(false, Error('error')),
      expectU(err(errResVal).flatten()).toBe<never, ResVal>(false, errResVal),
      expectU(asyncOk(errResVal).flatten()).toBe<P<'value'>, P<unknown>>(false, Error('error')),
      expectU(asyncErr(errResVal).flatten()).toBe<P<never>, P<ResVal>>(false, errResVal),

      expectU(asyncOkResVal.flatten()).toBe<P<'value'>, P<unknown>>(true, 'value'),
      expectU(ok(asyncOkResVal).flatten()).toBe<P<'value'>, P<unknown>>(true, 'value'),
      expectU(err(asyncOkResVal).flatten()).toBe<never, AsyncResVal>(false, okResVal),
      expectU(asyncOk(asyncOkResVal).flatten()).toBe<P<'value'>, Promise<unknown>>(true, 'value'),
      expectU(asyncErr(asyncOkResVal).flatten()).toBe<P<never>, P<ResVal>>(false, okVal),

      expectU(asyncErrResVal.flatten()).toBe<P<'value'>, P<unknown>>(false, Error('error')),
      expectU(ok(asyncErrResVal).flatten()).toBe<P<'value'>, P<unknown>>(false, Error('error')),
      expectU(err(asyncErrResVal).flatten()).toBe<never, AsyncResVal>(false, errResVal),
      expectU(asyncOk(asyncErrResVal).flatten()).toBe<P<'value'>, P<unknown>>(
        false,
        Error('error'),
      ),
      expectU(asyncErr(asyncErrResVal).flatten()).toBe<P<never>, P<ResVal>>(false, errResVal),
    ]);
  });

  it('should map a function `ok` and `err` values using `map` and `mapErr`', async () => {
    const mapFn = (v: string) => v === 'value';
    const mapErrFn = (v: unknown) => (v === 'error' ? ('new' as const) : ('old' as const));
    const asyncMapFn = async (v: string) => mapFn(v);
    const amef = async (v: unknown) => mapErrFn(v);

    function expectMap<T extends AnyResult>(value: T) {
      return {
        toBe: async <TValue extends AnyResult>(
          isOk: Ternary<Equal<T, TValue>, boolean, never>,
          v: ReturnType<Awaited<TValue>['unwrap'] | Awaited<TValue>['unwrapErr']>,
        ) => {
          if (isOk) expect((await value).unwrap()).toBe(v);
          else expect((await value).unwrapErr()).toStrictEqual(v);
        },
      };
    }

    type T1 = Err<unknown> | Ok<false> | Ok<true>; // TODO Why does the type split up like this?
    type T2 = Err<unknown> | AsyncOk<boolean>;
    type T3 = Ok<'value'> | Err<'new'> | Err<'old'>; // TODO Why does the type split up like this?
    type T4 = Ok<'value'> | AsyncErr<'new' | 'old'>;
    type T5 = AsyncResult<Err<unknown> | Ok<boolean>>;
    type T6 = AsyncResult<Ok<'value'> | Err<'new' | 'old'>>;

    await Promise.all([
      expectMap(okVal.map(mapFn)).toBe<Ok<true> | Ok<false>>(true, true), // TODO Why does the type split up like this?
      expectMap(okVal.map(asyncMapFn)).toBe<AsyncOk<boolean>>(true, true),
      expectMap(okVal.mapErr(mapErrFn)).toBe<Ok<'value'>>(true, 'value'),
      expectMap(okVal.mapErr(amef)).toBe<Ok<'value'>>(true, 'value'),
      expectMap(asyncOkVal.map(mapFn)).toBe<AsyncOk<boolean>>(true, true),
      expectMap(asyncOkVal.map(asyncMapFn)).toBe<AsyncOk<boolean>>(true, true),
      expectMap(asyncOkVal.mapErr(mapErrFn)).toBe<AsyncOk<'value'>>(true, 'value'),
      expectMap(asyncOkVal.mapErr(amef)).toBe<AsyncOk<'value'>>(true, 'value'),

      expectMap(errVal.map(mapFn)).toBe<Err<'error'>>(false, 'error'),
      expectMap(errVal.map(asyncMapFn)).toBe<Err<'error'>>(false, 'error'),
      expectMap(errVal.mapErr(mapErrFn)).toBe<Err<'new'> | Err<'old'>>(false, 'new'), // TODO Why does the type split up like this?
      expectMap(errVal.mapErr(amef)).toBe<AsyncErr<'new' | 'old'>>(false, 'new'),
      expectMap(asyncErrVal.map(mapFn)).toBe<AsyncErr<'error'>>(false, 'error'),
      expectMap(asyncErrVal.map(asyncMapFn)).toBe<AsyncErr<'error'>>(false, 'error'),
      expectMap(asyncErrVal.mapErr(mapErrFn)).toBe<AsyncErr<'new' | 'old'>>(false, 'new'),
      expectMap(asyncErrVal.mapErr(amef)).toBe<AsyncErr<'new' | 'old'>>(false, 'new'),

      expectMap(okResVal.map(mapFn)).toBe<T1>(true, true),
      expectMap(okResVal.map(asyncMapFn)).toBe<T2>(true, true),
      expectMap(okResVal.mapErr(mapErrFn)).toBe<T3>(true, 'value'),
      expectMap(okResVal.mapErr(amef)).toBe<T4>(true, 'value'),
      expectMap(asyncOkResVal.map(mapFn)).toBe<T5>(true, true),
      expectMap(asyncOkResVal.map(asyncMapFn)).toBe<T5>(true, true),
      expectMap(asyncOkResVal.mapErr(mapErrFn)).toBe<T6>(true, 'value'),
      expectMap(asyncOkResVal.mapErr(amef)).toBe<T6>(true, 'value'),

      expectMap(errResVal.map(mapFn)).toBe<T1>(false, Error('error')),
      expectMap(errResVal.map(asyncMapFn)).toBe<T2>(false, Error('error')),
      expectMap(errResVal.mapErr(mapErrFn)).toBe<T3>(false, 'old'),
      expectMap(errResVal.mapErr(amef)).toBe<T4>(false, 'old'),
      expectMap(asyncErrResVal.map(mapFn)).toBe<T5>(false, Error('error')),
      expectMap(asyncErrResVal.map(asyncMapFn)).toBe<T5>(false, Error('error')),
      expectMap(asyncErrResVal.mapErr(mapErrFn)).toBe<T6>(false, 'old'),
      expectMap(asyncErrResVal.mapErr(amef)).toBe<T6>(false, 'old'),
    ]);
  });

  it('should map function or return default value with `mapOr` and `mapOrElse`', async () => {
    function expectMap(value: 0 | 1 | 2) {
      return expect(value);
    }

    function expectAsyncMap(value: Promise<0 | 1 | 2>) {
      return expect(value);
    }

    function expectHalfAsyncMap(value: 0 | Promise<1 | 2>) {
      return expect(value);
    }

    const def = 0 as const;
    const defFn = () => def;
    const mapFn = (v: string) => (v === 'value' ? 1 : 2);
    const asyncMapFn = (v: string): Promise<1 | 2> => Promise.resolve(mapFn(v));

    await Promise.all([
      expectMap(okVal.mapOr(def, mapFn)).toBe(1),
      expectAsyncMap(okVal.mapOr(def, asyncMapFn)).resolves.toBe(1),
      expectMap(okVal.mapOrElse(defFn, mapFn)).toBe(1),
      expectAsyncMap(okVal.mapOrElse(defFn, asyncMapFn)).resolves.toBe(1),

      expectMap(errVal.mapOr(def, mapFn)).toBe(0),
      expectMap(errVal.mapOr(def, asyncMapFn)).toBe(0),
      expectMap(errVal.mapOrElse(defFn, mapFn)).toBe(0),
      expectMap(errVal.mapOrElse(defFn, asyncMapFn)).toBe(0),

      expectAsyncMap(asyncOkVal.mapOr(def, mapFn)).resolves.toBe(1),
      expectAsyncMap(asyncOkVal.mapOr(def, asyncMapFn)).resolves.toBe(1),
      expectAsyncMap(asyncOkVal.mapOrElse(defFn, mapFn)).resolves.toBe(1),
      expectAsyncMap(asyncOkVal.mapOrElse(defFn, asyncMapFn)).resolves.toBe(1),

      expectAsyncMap(asyncErrVal.mapOr(def, mapFn)).resolves.toBe(0),
      expectAsyncMap(asyncErrVal.mapOr(def, asyncMapFn)).resolves.toBe(0),
      expectAsyncMap(asyncErrVal.mapOrElse(defFn, mapFn)).resolves.toBe(0),
      expectAsyncMap(asyncErrVal.mapOrElse(defFn, asyncMapFn)).resolves.toBe(0),

      expectMap(okResVal.mapOr(def, mapFn)).toBe(1),
      expectHalfAsyncMap(okResVal.mapOr(def, asyncMapFn)).resolves.toBe(1),
      expectMap(okResVal.mapOrElse(defFn, mapFn)).toBe(1),
      expectHalfAsyncMap(okResVal.mapOrElse(defFn, asyncMapFn)).resolves.toBe(1),

      expectMap(errResVal.mapOr(def, mapFn)).toBe(0),
      expectHalfAsyncMap(errResVal.mapOr(def, asyncMapFn)).toBe(0),
      expectMap(errResVal.mapOrElse(defFn, mapFn)).toBe(0),
      expectHalfAsyncMap(errResVal.mapOrElse(defFn, asyncMapFn)).toBe(0),

      expectAsyncMap(asyncOkResVal.mapOr(def, mapFn)).resolves.toBe(1),
      expectAsyncMap(asyncOkResVal.mapOr(def, asyncMapFn)).resolves.toBe(1),
      expectAsyncMap(asyncOkResVal.mapOrElse(defFn, mapFn)).resolves.toBe(1),
      expectAsyncMap(asyncOkResVal.mapOrElse(defFn, asyncMapFn)).resolves.toBe(1),

      expectAsyncMap(asyncErrResVal.mapOr(def, mapFn)).resolves.toBe(0),
      expectAsyncMap(asyncErrResVal.mapOr(def, asyncMapFn)).resolves.toBe(0),
      expectAsyncMap(asyncErrResVal.mapOrElse(defFn, mapFn)).resolves.toBe(0),
      expectAsyncMap(asyncErrResVal.mapOrElse(defFn, asyncMapFn)).resolves.toBe(0),
    ]);
  });

  it('should apply the logical `and` operation between result values', async () => {
    await Promise.all([
      expectU(earlyOk.and(lateOk)).toBe<'late', never>(true, 'late'),
      expectU(earlyOk.and(lateErr)).toBe<never, 'late'>(false, 'late'),
      expectU(earlyOk.and(asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(earlyOk.and(asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(earlyOk.and(okRes2)).toBe<'v2', 'e2'>(true, 'v2'),
      expectU(earlyOk.and(errRes2)).toBe<'v2', 'e2'>(false, 'e2'),
      expectU(earlyOk.and(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(earlyOk.and(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(earlyErr.and(lateOk)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.and(lateErr)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.and(asyncLateOk)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.and(asyncLateErr)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.and(okRes2)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.and(errRes2)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.and(asyncOkRes2)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.and(asyncErrRes2)).toBe<never, 'early'>(false, 'early'),

      expectU(asyncEarlyOk.and(lateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyOk.and(lateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyOk.and(asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyOk.and(asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyOk.and(okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyOk.and(errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),
      expectU(asyncEarlyOk.and(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyOk.and(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(asyncEarlyErr.and(lateOk)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.and(lateErr)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.and(asyncLateOk)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.and(asyncLateErr)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.and(okRes2)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.and(errRes2)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.and(asyncOkRes2)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.and(asyncErrRes2)).toBe<P<never>, P<'early'>>(false, 'early'),

      expectU(okRes1.and(lateOk)).toBe<'late', 'e1'>(true, 'late'),
      expectU(okRes1.and(lateErr)).toBe<never, 'e1' | 'late'>(false, 'late'),
      expectU(okRes1.and(asyncLateOk)).toBe<P<'late'>, 'e1' | P<never>>(true, 'late'),
      expectU(okRes1.and(asyncLateErr)).toBe<P<never>, 'e1' | P<'late'>>(false, 'late'),
      expectU(okRes1.and(okRes2)).toBe<'v2', 'e1' | 'e2'>(true, 'v2'),
      expectU(okRes1.and(errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e2'),
      expectU(okRes1.and(asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2'),
      expectU(okRes1.and(asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2'),

      expectU(errRes1.and(lateOk)).toBe<'late', 'e1'>(false, 'e1'),
      expectU(errRes1.and(lateErr)).toBe<never, 'e1' | 'late'>(false, 'e1'),
      expectU(errRes1.and(asyncLateOk)).toBe<P<'late'>, 'e1' | P<never>>(false, 'e1'),
      expectU(errRes1.and(asyncLateErr)).toBe<P<never>, 'e1' | P<'late'>>(false, 'e1'),
      expectU(errRes1.and(okRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1'),
      expectU(errRes1.and(errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1'),
      expectU(errRes1.and(asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1'),
      expectU(errRes1.and(asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1'),

      expectU(asyncOkRes1.and(lateOk)).toBe<P<'late'>, P<'e1'>>(true, 'late'),
      expectU(asyncOkRes1.and(lateErr)).toBe<P<never>, P<'e1' | 'late'>>(false, 'late'),
      expectU(asyncOkRes1.and(asyncLateOk)).toBe<P<'late'>, P<'e1'>>(true, 'late'),
      expectU(asyncOkRes1.and(asyncLateErr)).toBe<P<never>, P<'e1' | 'late'>>(false, 'late'),
      expectU(asyncOkRes1.and(okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2'),
      expectU(asyncOkRes1.and(errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2'),
      expectU(asyncOkRes1.and(asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2'),
      expectU(asyncOkRes1.and(asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2'),

      expectU(asyncErrRes1.and(lateOk)).toBe<P<'late'>, P<'e1'>>(false, 'e1'),
      expectU(asyncErrRes1.and(lateErr)).toBe<P<never>, P<'e1' | 'late'>>(false, 'e1'),
      expectU(asyncErrRes1.and(asyncLateOk)).toBe<P<'late'>, P<'e1'>>(false, 'e1'),
      expectU(asyncErrRes1.and(asyncLateErr)).toBe<P<never>, P<'e1' | 'late'>>(false, 'e1'),
      expectU(asyncErrRes1.and(okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
      expectU(asyncErrRes1.and(errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
      expectU(asyncErrRes1.and(asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
      expectU(asyncErrRes1.and(asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
    ]);
  });

  it('should apply the logical `or` operation between result values', async () => {
    await Promise.all([
      expectU(earlyOk.or(lateOk)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.or(lateErr)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.or(asyncLateOk)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.or(asyncLateErr)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.or(okRes2)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.or(errRes2)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.or(asyncOkRes2)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.or(asyncErrRes2)).toBe<'early', never>(true, 'early'),

      expectU(earlyErr.or(lateOk)).toBe<'late', never>(true, 'late'),
      expectU(earlyErr.or(lateErr)).toBe<never, 'late'>(false, 'late'),
      expectU(earlyErr.or(asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(earlyErr.or(asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(earlyErr.or(okRes2)).toBe<'v2', 'e2'>(true, 'v2'),
      expectU(earlyErr.or(errRes2)).toBe<'v2', 'e2'>(false, 'e2'),
      expectU(earlyErr.or(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(earlyErr.or(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(asyncEarlyOk.or(lateOk)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.or(lateErr)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.or(asyncLateOk)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.or(asyncLateErr)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.or(okRes2)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.or(errRes2)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.or(asyncOkRes2)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.or(asyncErrRes2)).toBe<P<'early'>, P<never>>(true, 'early'),

      expectU(asyncEarlyErr.or(lateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyErr.or(lateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyErr.or(asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyErr.or(asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyErr.or(okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyErr.or(errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),
      expectU(asyncEarlyErr.or(asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyErr.or(asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(okRes1.or(lateOk)).toBe<'v1' | 'late', never>(true, 'v1'),
      expectU(okRes1.or(lateErr)).toBe<'v1', 'late'>(true, 'v1'),
      expectU(okRes1.or(asyncLateOk)).toBe<'v1' | P<'late'>, P<never>>(true, 'v1'),
      expectU(okRes1.or(asyncLateErr)).toBe<'v1' | P<never>, P<'late'>>(true, 'v1'),
      expectU(okRes1.or(okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1'),
      expectU(okRes1.or(errRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1'),
      expectU(okRes1.or(asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1'),
      expectU(okRes1.or(asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1'),

      expectU(errRes1.or(lateOk)).toBe<'v1' | 'late', never>(true, 'late'),
      expectU(errRes1.or(lateErr)).toBe<'v1', 'late'>(false, 'late'),
      expectU(errRes1.or(asyncLateOk)).toBe<'v1' | P<'late'>, P<never>>(true, 'late'),
      expectU(errRes1.or(asyncLateErr)).toBe<'v1' | P<never>, P<'late'>>(false, 'late'),
      expectU(errRes1.or(okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v2'),
      expectU(errRes1.or(errRes2)).toBe<'v1' | 'v2', 'e2'>(false, 'e2'),
      expectU(errRes1.or(asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(errRes1.or(asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(asyncOkRes1.or(lateOk)).toBe<P<'v1' | 'late'>, P<never>>(true, 'v1'),
      expectU(asyncOkRes1.or(lateErr)).toBe<P<'v1'>, P<'late'>>(true, 'v1'),
      expectU(asyncOkRes1.or(asyncLateOk)).toBe<P<'v1' | 'late'>, P<never>>(true, 'v1'),
      expectU(asyncOkRes1.or(asyncLateErr)).toBe<P<'v1'>, P<'late'>>(true, 'v1'),
      expectU(asyncOkRes1.or(okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),
      expectU(asyncOkRes1.or(errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),
      expectU(asyncOkRes1.or(asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),
      expectU(asyncOkRes1.or(asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),

      expectU(asyncErrRes1.or(lateOk)).toBe<P<'v1' | 'late'>, P<never>>(true, 'late'),
      expectU(asyncErrRes1.or(lateErr)).toBe<P<'v1'>, P<'late'>>(false, 'late'),
      expectU(asyncErrRes1.or(asyncLateOk)).toBe<P<'v1' | 'late'>, P<never>>(true, 'late'),
      expectU(asyncErrRes1.or(asyncLateErr)).toBe<P<'v1'>, P<'late'>>(false, 'late'),
      expectU(asyncErrRes1.or(okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncErrRes1.or(errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2'),
      expectU(asyncErrRes1.or(asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncErrRes1.or(asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2'),
    ]);
  });

  it('should facilitate `andThen` chaining for result transformations', async () => {
    await Promise.all([
      expectU(earlyOk.andThen(() => lateOk)).toBe<'late', never>(true, 'late'),
      expectU(earlyOk.andThen(() => lateErr)).toBe<never, 'late'>(false, 'late'),
      expectU(earlyOk.andThen(() => asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(earlyOk.andThen(() => asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(earlyOk.andThen(() => okRes2)).toBe<'v2', 'e2'>(true, 'v2'),
      expectU(earlyOk.andThen(() => errRes2)).toBe<'v2', 'e2'>(false, 'e2'),
      expectU(earlyOk.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(earlyOk.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(earlyErr.andThen(() => lateOk)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.andThen(() => lateErr)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.andThen(() => asyncLateOk)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.andThen(() => asyncLateErr)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.andThen(() => okRes2)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.andThen(() => errRes2)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.andThen(() => asyncOkRes2)).toBe<never, 'early'>(false, 'early'),
      expectU(earlyErr.andThen(() => asyncErrRes2)).toBe<never, 'early'>(false, 'early'),

      expectU(asyncEarlyOk.andThen(() => lateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyOk.andThen(() => lateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyOk.andThen(() => asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyOk.andThen(() => asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyOk.andThen(() => okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyOk.andThen(() => errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),
      expectU(asyncEarlyOk.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyOk.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(asyncEarlyErr.andThen(() => lateOk)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.andThen(() => lateErr)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.andThen(() => asyncLateOk)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.andThen(() => asyncLateErr)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.andThen(() => okRes2)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.andThen(() => errRes2)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.andThen(() => asyncOkRes2)).toBe<P<never>, P<'early'>>(false, 'early'),
      expectU(asyncEarlyErr.andThen(() => asyncErrRes2)).toBe<P<never>, P<'early'>>(false, 'early'),

      expectU(okRes1.andThen(() => lateOk)).toBe<'late', 'e1'>(true, 'late'),
      expectU(okRes1.andThen(() => lateErr)).toBe<never, 'e1' | 'late'>(false, 'late'),
      expectU(okRes1.andThen(() => asyncLateOk)).toBe<P<'late'>, 'e1' | P<never>>(true, 'late'),
      expectU(okRes1.andThen(() => asyncLateErr)).toBe<P<never>, 'e1' | P<'late'>>(false, 'late'),
      expectU(okRes1.andThen(() => okRes2)).toBe<'v2', 'e1' | 'e2'>(true, 'v2'),
      expectU(okRes1.andThen(() => errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e2'),
      expectU(okRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(true, 'v2'),
      expectU(okRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e2'),

      expectU(errRes1.andThen(() => lateOk)).toBe<'late', 'e1'>(false, 'e1'),
      expectU(errRes1.andThen(() => lateErr)).toBe<never, 'e1' | 'late'>(false, 'e1'),
      expectU(errRes1.andThen(() => asyncLateOk)).toBe<P<'late'>, 'e1' | P<never>>(false, 'e1'),
      expectU(errRes1.andThen(() => asyncLateErr)).toBe<P<never>, 'e1' | P<'late'>>(false, 'e1'),
      expectU(errRes1.andThen(() => okRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1'),
      expectU(errRes1.andThen(() => errRes2)).toBe<'v2', 'e1' | 'e2'>(false, 'e1'),
      expectU(errRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1'),
      expectU(errRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, 'e1' | P<'e2'>>(false, 'e1'),

      expectU(asyncOkRes1.andThen(() => lateOk)).toBe<P<'late'>, P<'e1'>>(true, 'late'),
      expectU(asyncOkRes1.andThen(() => lateErr)).toBe<P<never>, P<'e1' | 'late'>>(false, 'late'),
      expectU(asyncOkRes1.andThen(() => asyncLateOk)).toBe<P<'late'>, P<'e1'>>(true, 'late'),
      expectU(asyncOkRes1.andThen(() => asyncLateErr)).toBe<P<never>, P<'e1' | 'late'>>(
        false,
        'late',
      ),
      expectU(asyncOkRes1.andThen(() => okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2'),
      expectU(asyncOkRes1.andThen(() => errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2'),
      expectU(asyncOkRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(true, 'v2'),
      expectU(asyncOkRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e2'),

      expectU(asyncErrRes1.andThen(() => lateOk)).toBe<P<'late'>, P<'e1'>>(false, 'e1'),
      expectU(asyncErrRes1.andThen(() => lateErr)).toBe<P<never>, P<'e1' | 'late'>>(false, 'e1'),
      expectU(asyncErrRes1.andThen(() => asyncLateOk)).toBe<P<'late'>, P<'e1'>>(false, 'e1'),
      expectU(asyncErrRes1.andThen(() => asyncLateErr)).toBe<P<never>, P<'e1' | 'late'>>(
        false,
        'e1',
      ),
      expectU(asyncErrRes1.andThen(() => okRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
      expectU(asyncErrRes1.andThen(() => errRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
      expectU(asyncErrRes1.andThen(() => asyncOkRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
      expectU(asyncErrRes1.andThen(() => asyncErrRes2)).toBe<P<'v2'>, P<'e1' | 'e2'>>(false, 'e1'),
    ]);
  });

  it('should facilitate `orElse` chaining for error handling in results', async () => {
    await Promise.all([
      expectU(earlyOk.orElse(() => lateOk)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.orElse(() => lateErr)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.orElse(() => asyncLateOk)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.orElse(() => asyncLateErr)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.orElse(() => okRes2)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.orElse(() => errRes2)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.orElse(() => asyncOkRes2)).toBe<'early', never>(true, 'early'),
      expectU(earlyOk.orElse(() => asyncErrRes2)).toBe<'early', never>(true, 'early'),

      expectU(earlyErr.orElse(() => lateOk)).toBe<'late', never>(true, 'late'),
      expectU(earlyErr.orElse(() => lateErr)).toBe<never, 'late'>(false, 'late'),
      expectU(earlyErr.orElse(() => asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(earlyErr.orElse(() => asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(earlyErr.orElse(() => okRes2)).toBe<'v2', 'e2'>(true, 'v2'),
      expectU(earlyErr.orElse(() => errRes2)).toBe<'v2', 'e2'>(false, 'e2'),
      expectU(earlyErr.orElse(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(earlyErr.orElse(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(asyncEarlyOk.orElse(() => lateOk)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.orElse(() => lateErr)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.orElse(() => asyncLateOk)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.orElse(() => asyncLateErr)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.orElse(() => okRes2)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.orElse(() => errRes2)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.orElse(() => asyncOkRes2)).toBe<P<'early'>, P<never>>(true, 'early'),
      expectU(asyncEarlyOk.orElse(() => asyncErrRes2)).toBe<P<'early'>, P<never>>(true, 'early'),

      expectU(asyncEarlyErr.orElse(() => lateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyErr.orElse(() => lateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyErr.orElse(() => asyncLateOk)).toBe<P<'late'>, P<never>>(true, 'late'),
      expectU(asyncEarlyErr.orElse(() => asyncLateErr)).toBe<P<never>, P<'late'>>(false, 'late'),
      expectU(asyncEarlyErr.orElse(() => okRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyErr.orElse(() => errRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),
      expectU(asyncEarlyErr.orElse(() => asyncOkRes2)).toBe<P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncEarlyErr.orElse(() => asyncErrRes2)).toBe<P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(okRes1.orElse(() => lateOk)).toBe<'v1' | 'late', never>(true, 'v1'),
      expectU(okRes1.orElse(() => lateErr)).toBe<'v1', 'late'>(true, 'v1'),
      expectU(okRes1.orElse(() => asyncLateOk)).toBe<'v1' | P<'late'>, P<never>>(true, 'v1'),
      expectU(okRes1.orElse(() => asyncLateErr)).toBe<'v1' | P<never>, P<'late'>>(true, 'v1'),
      expectU(okRes1.orElse(() => okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1'),
      expectU(okRes1.orElse(() => errRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v1'),
      expectU(okRes1.orElse(() => asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1'),
      expectU(okRes1.orElse(() => asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v1'),

      expectU(errRes1.orElse(() => lateOk)).toBe<'v1' | 'late', never>(true, 'late'),
      expectU(errRes1.orElse(() => lateErr)).toBe<'v1', 'late'>(false, 'late'),
      expectU(errRes1.orElse(() => asyncLateOk)).toBe<'v1' | P<'late'>, P<never>>(true, 'late'),
      expectU(errRes1.orElse(() => asyncLateErr)).toBe<'v1' | P<never>, P<'late'>>(false, 'late'),
      expectU(errRes1.orElse(() => okRes2)).toBe<'v1' | 'v2', 'e2'>(true, 'v2'),
      expectU(errRes1.orElse(() => errRes2)).toBe<'v1' | 'v2', 'e2'>(false, 'e2'),
      expectU(errRes1.orElse(() => asyncOkRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(true, 'v2'),
      expectU(errRes1.orElse(() => asyncErrRes2)).toBe<'v1' | P<'v2'>, P<'e2'>>(false, 'e2'),

      expectU(asyncOkRes1.orElse(() => lateOk)).toBe<P<'v1' | 'late'>, P<never>>(true, 'v1'),
      expectU(asyncOkRes1.orElse(() => lateErr)).toBe<P<'v1'>, P<'late'>>(true, 'v1'),
      expectU(asyncOkRes1.orElse(() => asyncLateOk)).toBe<P<'v1' | 'late'>, P<never>>(true, 'v1'),
      expectU(asyncOkRes1.orElse(() => asyncLateErr)).toBe<P<'v1'>, P<'late'>>(true, 'v1'),
      expectU(asyncOkRes1.orElse(() => okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),
      expectU(asyncOkRes1.orElse(() => errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),
      expectU(asyncOkRes1.orElse(() => asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),
      expectU(asyncOkRes1.orElse(() => asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v1'),

      expectU(asyncErrRes1.orElse(() => lateOk)).toBe<P<'v1' | 'late'>, P<never>>(true, 'late'),
      expectU(asyncErrRes1.orElse(() => lateErr)).toBe<P<'v1'>, P<'late'>>(false, 'late'),
      expectU(asyncErrRes1.orElse(() => asyncLateOk)).toBe<P<'v1' | 'late'>, P<never>>(
        true,
        'late',
      ),
      expectU(asyncErrRes1.orElse(() => asyncLateErr)).toBe<P<'v1'>, P<'late'>>(false, 'late'),
      expectU(asyncErrRes1.orElse(() => okRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncErrRes1.orElse(() => errRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2'),
      expectU(asyncErrRes1.orElse(() => asyncOkRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(true, 'v2'),
      expectU(asyncErrRes1.orElse(() => asyncErrRes2)).toBe<P<'v1' | 'v2'>, P<'e2'>>(false, 'e2'),
    ]);
  });

  it('should emulate Rust\'s "match" syntax', async () => {
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

    const asyncOkMatch = asyncOkVal.match({
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
    expect(mockFn).toHaveBeenCalledTimes(2);
    expectTypeOf(asyncOkMatch).toEqualTypeOf<P<'value'>>();
    await expect(asyncOkMatch).resolves.toBe('value');
    expect(mockFn).toHaveBeenCalledTimes(3);

    const asyncErrMatch = asyncOkVal.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'value'>();
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<never>();
        expect(error).toBe('error');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(3);
    expectTypeOf(asyncErrMatch).toEqualTypeOf<P<'value'>>();
    await expect(asyncErrMatch).resolves.toBe('value');
    expect(mockFn).toHaveBeenCalledTimes(4);

    const okResMatch = okRes1.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'v1'>();
        expect(value).toBe('v1');
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'e1'>();
        expect(error).toBe('e1');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(5);
    expectTypeOf(okResMatch).toEqualTypeOf<'v1' | 'e1'>();
    expect(okResMatch).toBe('v1');

    const errResMatch = errRes1.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'v1'>();
        expect(value).toBe('v1');
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'e1'>();
        expect(error).toBe('e1');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(6);
    expectTypeOf(errResMatch).toEqualTypeOf<'v1' | 'e1'>();
    expect(errResMatch).toBe('e1');

    const asyncOkResMatch = asyncOkRes1.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'v1'>();
        expect(value).toBe('v1');
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'e1'>();
        expect(error).toBe('e1');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(6);
    expectTypeOf(asyncOkResMatch).toEqualTypeOf<P<'v1' | 'e1'>>();
    await expect(asyncOkResMatch).resolves.toBe('v1');
    expect(mockFn).toHaveBeenCalledTimes(7);

    const asyncErrResMatch = asyncErrRes1.match({
      ok: (value) => {
        expectTypeOf(value).toEqualTypeOf<'v1'>();
        expect(value).toBe('v1');
        mockFn();
        return value;
      },
      err: (error) => {
        expectTypeOf(error).toEqualTypeOf<'e1'>();
        expect(error).toBe('e1');
        mockFn();
        return error;
      },
    });
    expect(mockFn).toHaveBeenCalledTimes(7);
    expectTypeOf(asyncErrResMatch).toEqualTypeOf<P<'v1' | 'e1'>>();
    await expect(asyncErrResMatch).resolves.toBe('e1');
    expect(mockFn).toHaveBeenCalledTimes(8);
  });
});
