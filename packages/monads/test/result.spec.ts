import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  AnyAsyncResult,
  AnyOption,
  AnyResult,
  AsyncResult,
  Err,
  Ok,
  Result,
  asyncErr,
  asyncOk,
  asyncResult,
  err,
  ok,
  result,
} from '../src';
import { None, Option, Some, none, some } from '../src';
import { AsyncErr, AsyncOk } from '../src/result/async-result';
import { And, Equal, MaybePromise, Ternary } from '../src/util';

function expectResultUnwrap<TResult extends AnyResult | AnyAsyncResult>(_result: TResult) {
  return {
    toBe: <TUnwrap, TUnwrapErr>(
      _val: And<
        Equal<ReturnType<TResult['unwrap']>, TUnwrap>,
        Equal<ReturnType<TResult['unwrapErr']>, TUnwrapErr>
      >,
    ) => {},
  };
}

function expectUnwrap<TResult extends AnyResult | AnyAsyncResult>(result: TResult) {
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
      if (isOk) expect(await result.unwrap()).toBe(unwrappedValue);
      else expect(await result.unwrapErr()).toBe(unwrappedValue);
    },
  };
}

function returns(): 'value' {
  return 'value';
}

function throws(): 'value' {
  throw new Error('error');
}

async function returnsAsync(): Promise<'value'> {
  return 'value';
}

async function throwsAsync(): Promise<'value'> {
  throw new Error('error');
}

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

const okRes1 = ok('value1') as Result<'value1', 'error1'>;
const okRes2 = ok('value2') as Result<'value2', 'error2'>;
const errRes1 = err('error1') as Result<'value1', 'error1'>;
const errRes2 = err('error2') as Result<'value2', 'error2'>;
const okResVal = result(returns);
const errResVal = result(throws);
const asyncOkResVal = asyncResult(returnsAsync);
const asyncErrResVal = asyncResult(throwsAsync);

describe('Result', () => {
  it('should have type-safe `ok` and `err` properties', async () => {
    function expectIsOkIsErr<TResult extends AnyResult | AnyAsyncResult>(result: TResult) {
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
          // TODO how to add context to this so that if it fails, we know under which circumstances it failed
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
      expectIsOkIsErr(asyncOkVal).toBe<Promise<true>, Promise<false>>(true, false),
      expectIsOkIsErr(asyncErrVal).toBe<Promise<false>, Promise<true>>(false, true),
      expectIsOkIsErr(asyncOkResVal).toBe<Promise<boolean>, Promise<boolean>>(true, false),
      expectIsOkIsErr(asyncErrResVal).toBe<Promise<boolean>, Promise<boolean>>(false, true),
    ]);
  });

  it('should type-narrow based on `isOk` and `isErr` checks', () => {
    // TODO is this possible for AsyncResult?
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
      expectPredicate(okVal.isOkAnd(pAsyncTrue)).toBe<Promise<true>>(true),
      expectPredicate(okVal.isOkAnd(pAsyncFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncOkVal.isOkAnd(pTrue)).toBe<Promise<true>>(true),
      expectPredicate(asyncOkVal.isOkAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncOkVal.isOkAnd(pAsyncTrue)).toBe<Promise<true>>(true),
      expectPredicate(asyncOkVal.isOkAnd(pAsyncFalse)).toBe<Promise<false>>(false),

      expectPredicate(errVal.isOkAnd(pTrue)).toBe<false>(false),
      expectPredicate(errVal.isOkAnd(pFalse)).toBe<false>(false),
      expectPredicate(errVal.isOkAnd(pAsyncTrue)).toBe<false>(false),
      expectPredicate(errVal.isOkAnd(pAsyncFalse)).toBe<false>(false),
      expectPredicate(asyncErrVal.isOkAnd(pTrue)).toBe<Promise<false>>(false),
      expectPredicate(asyncErrVal.isOkAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncErrVal.isOkAnd(pAsyncTrue)).toBe<Promise<false>>(false),
      expectPredicate(asyncErrVal.isOkAnd(pAsyncFalse)).toBe<Promise<false>>(false),

      expectPredicate(okResVal.isOkAnd(pTrue)).toBe<boolean>(true),
      expectPredicate(okResVal.isOkAnd(pFalse)).toBe<false>(false),
      expectPredicate(okResVal.isOkAnd(pAsyncTrue)).toBe<false | Promise<true>>(true),
      expectPredicate(okResVal.isOkAnd(pAsyncFalse)).toBe<false | Promise<false>>(false),
      expectPredicate(asyncOkResVal.isOkAnd(pTrue)).toBe<Promise<boolean>>(true),
      expectPredicate(asyncOkResVal.isOkAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncOkResVal.isOkAnd(pAsyncTrue)).toBe<Promise<boolean>>(true),
      expectPredicate(asyncOkResVal.isOkAnd(pAsyncFalse)).toBe<Promise<false>>(false),

      expectPredicate(errResVal.isOkAnd(pTrue)).toBe<boolean>(false),
      expectPredicate(errResVal.isOkAnd(pFalse)).toBe<false>(false),
      expectPredicate(errResVal.isOkAnd(pAsyncTrue)).toBe<false | Promise<true>>(false),
      expectPredicate(errResVal.isOkAnd(pAsyncFalse)).toBe<false | Promise<false>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pTrue)).toBe<Promise<boolean>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pAsyncTrue)).toBe<Promise<boolean>>(false),
      expectPredicate(asyncErrResVal.isOkAnd(pAsyncFalse)).toBe<Promise<false>>(false),

      expectPredicate(okVal.isErrAnd(pTrue)).toBe<false>(false),
      expectPredicate(okVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(okVal.isErrAnd(pAsyncTrue)).toBe<false>(false),
      expectPredicate(okVal.isErrAnd(pAsyncFalse)).toBe<false>(false),
      expectPredicate(asyncOkVal.isErrAnd(pTrue)).toBe<Promise<false>>(false),
      expectPredicate(asyncOkVal.isErrAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncOkVal.isErrAnd(pAsyncTrue)).toBe<Promise<false>>(false),
      expectPredicate(asyncOkVal.isErrAnd(pAsyncFalse)).toBe<Promise<false>>(false),

      expectPredicate(errVal.isErrAnd(pTrue)).toBe<true>(true),
      expectPredicate(errVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(errVal.isErrAnd(pAsyncTrue)).toBe<Promise<true>>(true),
      expectPredicate(errVal.isErrAnd(pAsyncFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncErrVal.isErrAnd(pTrue)).toBe<Promise<true>>(true),
      expectPredicate(asyncErrVal.isErrAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncErrVal.isErrAnd(pAsyncTrue)).toBe<Promise<true>>(true),
      expectPredicate(asyncErrVal.isErrAnd(pAsyncFalse)).toBe<Promise<false>>(false),

      expectPredicate(okResVal.isErrAnd(pTrue)).toBe<boolean>(false),
      expectPredicate(okResVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(okResVal.isErrAnd(pAsyncTrue)).toBe<false | Promise<true>>(false),
      expectPredicate(okResVal.isErrAnd(pAsyncFalse)).toBe<false | Promise<false>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pTrue)).toBe<Promise<boolean>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pAsyncTrue)).toBe<Promise<boolean>>(false),
      expectPredicate(asyncOkResVal.isErrAnd(pAsyncFalse)).toBe<Promise<false>>(false),

      expectPredicate(errResVal.isErrAnd(pTrue)).toBe<boolean>(true),
      expectPredicate(errResVal.isErrAnd(pFalse)).toBe<false>(false),
      expectPredicate(errResVal.isErrAnd(pAsyncTrue)).toBe<false | Promise<true>>(true),
      expectPredicate(errResVal.isErrAnd(pAsyncFalse)).toBe<false | Promise<false>>(false),
      expectPredicate(asyncErrResVal.isErrAnd(pTrue)).toBe<Promise<boolean>>(true),
      expectPredicate(asyncErrResVal.isErrAnd(pFalse)).toBe<Promise<false>>(false),
      expectPredicate(asyncErrResVal.isErrAnd(pAsyncTrue)).toBe<Promise<boolean>>(true),
      expectPredicate(asyncErrResVal.isErrAnd(pAsyncFalse)).toBe<Promise<false>>(false),
    ]);
  });

  it('should facilitate inspection of `ok` and `err` values with `inspect` and `inspectErr`', async () => {
    function expectInspect<TResult extends AnyResult | AnyAsyncResult>(result: TResult) {
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
          value: unknown,
        ) => {
          const inspectMockFn = vi.fn();
          const inspectResult = result.inspect((v) => {
            expect(v).toStrictEqual(value);
            inspectMockFn();
          });
          if (isAsync) {
            expect(inspectMockFn).toHaveBeenCalledTimes(0);
            await inspectResult;
          }
          expect(inspectMockFn).toHaveBeenCalledTimes(isOk ? 1 : 0);

          const inspectAsyncMockFn = vi.fn();
          const asyncInspectResult = result.inspect(async (v) => {
            expect(v).toStrictEqual(value);
            inspectAsyncMockFn();
          });
          if (isAsync) {
            expect(inspectAsyncMockFn).toHaveBeenCalledTimes(0);
            await asyncInspectResult;
          }
          expect(inspectAsyncMockFn).toHaveBeenCalledTimes(isOk ? 1 : 0);

          const inspectErrMockFn = vi.fn();
          const inspectErrResult = result.inspectErr((e) => {
            expect(e).toStrictEqual(value);
            inspectErrMockFn();
          });
          if (isAsync) {
            expect(inspectErrMockFn).toHaveBeenCalledTimes(0);
            await inspectErrResult;
          }
          expect(inspectErrMockFn).toHaveBeenCalledTimes(isOk ? 0 : 1);

          const inspectErrAsyncMockFn = vi.fn();
          const asyncInspectErrResult = result.inspectErr(async (e) => {
            expect(e).toStrictEqual(value);
            inspectErrAsyncMockFn();
          });
          if (isAsync) {
            expect(inspectErrAsyncMockFn).toHaveBeenCalledTimes(0);
            await asyncInspectErrResult;
          }
          expect(inspectErrAsyncMockFn).toHaveBeenCalledTimes(isOk ? 0 : 1);
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

    expectResultUnwrap(asyncOkVal).toBe<Promise<'value'>, Promise<never>>(true);
    expect(await asyncOkVal.unwrap()).toBe('value');
    expect(() => asyncOkVal.unwrapErr()).rejects.toThrow(
      "Attempted to unwrapErr an 'ok' value: value",
    );

    expectResultUnwrap(asyncErrVal).toBe<Promise<never>, Promise<'error'>>(true);
    expect(() => asyncErrVal.unwrap()).rejects.toThrow('error');
    expect(await asyncErrVal.unwrapErr()).toBe('error');

    expectResultUnwrap(asyncOkResVal).toBe<Promise<'value'>, Promise<unknown>>(true);
    expect(await asyncOkResVal.unwrap()).toBe('value');
    expect(() => asyncOkResVal.unwrapErr()).rejects.toThrow(
      "Attempted to unwrapErr an 'ok' value: value",
    );

    expectResultUnwrap(asyncErrResVal).toBe<Promise<'value'>, Promise<unknown>>(true);
    expect(() => asyncErrResVal.unwrap()).rejects.toThrow('error');
    expect(await asyncErrResVal.unwrapErr()).toStrictEqual(Error('error'));
  });

  it('should unwrap the contained value or return a default with `unwrapOr` and `unwrapOrElse`', async () => {
    const dfVal = 'default' as const;
    const aDfVal = Promise.resolve(dfVal);
    const dfFn = () => dfVal;
    const aDfFn = async () => dfVal;

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
      expectUnwrap(asyncOkVal.unwrapOr(dfVal)).toBe<Promise<'value'>>('value'),
      expectUnwrap(asyncOkVal.unwrapOr(aDfVal)).toBe<Promise<'value'>>('value'),
      expectUnwrap(asyncOkVal.unwrapOrElse(dfFn)).toBe<Promise<'value'>>('value'),
      expectUnwrap(asyncOkVal.unwrapOrElse(aDfFn)).toBe<Promise<'value'>>('value'),

      expectUnwrap(errVal.unwrapOr(dfVal)).toBe<'default'>('default'),
      expectUnwrap(errVal.unwrapOr(aDfVal)).toBe<Promise<'default'>>('default'),
      expectUnwrap(errVal.unwrapOrElse(dfFn)).toBe<'default'>('default'),
      expectUnwrap(errVal.unwrapOrElse(aDfFn)).toBe<Promise<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOr(dfVal)).toBe<Promise<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOr(aDfVal)).toBe<Promise<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOrElse(dfFn)).toBe<Promise<'default'>>('default'),
      expectUnwrap(asyncErrVal.unwrapOrElse(aDfFn)).toBe<Promise<'default'>>('default'),

      expectUnwrap(okResVal.unwrapOr(dfVal)).toBe<'value' | 'default'>('value'),
      expectUnwrap(okResVal.unwrapOr(aDfVal)).toBe<'value' | Promise<'default'>>('value'),
      expectUnwrap(okResVal.unwrapOrElse(dfFn)).toBe<'value' | 'default'>('value'),
      expectUnwrap(okResVal.unwrapOrElse(aDfFn)).toBe<'value' | Promise<'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOr(dfVal)).toBe<Promise<'value' | 'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOr(aDfVal)).toBe<Promise<'value' | 'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOrElse(dfFn)).toBe<Promise<'value' | 'default'>>('value'),
      expectUnwrap(asyncOkResVal.unwrapOrElse(aDfFn)).toBe<Promise<'value' | 'default'>>('value'),

      expectUnwrap(errResVal.unwrapOr(dfVal)).toBe<'value' | 'default'>('default'),
      expectUnwrap(errResVal.unwrapOr(aDfVal)).toBe<'value' | Promise<'default'>>('default'),
      expectUnwrap(errResVal.unwrapOrElse(dfFn)).toBe<'value' | 'default'>('default'),
      expectUnwrap(errResVal.unwrapOrElse(aDfFn)).toBe<'value' | Promise<'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOr(dfVal)).toBe<Promise<'value' | 'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOr(aDfVal)).toBe<Promise<'value' | 'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOrElse(dfFn)).toBe<Promise<'value' | 'default'>>('default'),
      expectUnwrap(asyncErrResVal.unwrapOrElse(aDfFn)).toBe<Promise<'value' | 'default'>>(
        'default',
      ),
    ]);
  });

  it('should convert to respective `Option` types using `ok` and `err`', async () => {
    function expectOkErr<TResult extends AnyResult | AnyAsyncResult>(result: TResult) {
      return {
        toBe: async <TOk extends MaybePromise<AnyOption>, TErr extends MaybePromise<AnyOption>>(
          isOk: Ternary<
            And<Equal<TOk, ReturnType<TResult['ok']>>, Equal<TErr, ReturnType<TResult['err']>>>,
            boolean,
            never
          >,
          value: ReturnType<(TOk | TErr)['unwrap']>,
        ) => {
          const o = await result.ok();
          expect(o.isSome).toBe(isOk);
          expect(o.isNone).toBe(!isOk);
          if (isOk) expect(o.unwrap()).toStrictEqual(value);
          else expect(o.unwrap).toThrow();

          const e = await result.err();
          expect(e.isSome).toBe(!isOk);
          expect(e.isNone).toBe(isOk);
          if (!isOk) expect(e.unwrap()).toStrictEqual(value);
          else expect(e.unwrap).toThrow();
        },
      };
    }

    await Promise.all([
      expectOkErr(okVal).toBe<Some<'value'>, None>(true, 'value'),
      expectOkErr(errVal).toBe<None, Some<'error'>>(false, 'error'),
      expectOkErr(okResVal).toBe<Option<'value'>, Option<unknown>>(true, 'value'),
      expectOkErr(errResVal).toBe<Option<'value'>, Option<unknown>>(false, Error('error')),
      // TODO AsyncOption
      expectOkErr(asyncOkVal).toBe<Promise<Some<'value'>>, Promise<None>>(true, 'value'),
      expectOkErr(asyncErrVal).toBe<Promise<None>, Promise<Some<'error'>>>(false, 'error'),
      expectOkErr(asyncOkResVal).toBe<Promise<Option<'value'>>, Promise<Option<unknown>>>(
        true,
        'value',
      ),
      expectOkErr(asyncErrResVal).toBe<Promise<Option<'value'>>, Promise<Option<unknown>>>(
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
    const mapErrFn = (v: unknown) => (v === 'error' ? ('new' as const) : ('old' as const));
    const asyncMapFn = async (v: string) => mapFn(v);
    const amef = async (v: unknown) => mapErrFn(v);

    function expectMap<T extends AnyResult | AnyAsyncResult>(value: T) {
      return {
        toBe: async <TValue extends AnyResult | AnyAsyncResult>(
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

  it('should apply the logical `and` operation between result values', async () => {
    type PN = Promise<never>;

    await Promise.all([
      expectUnwrap(earlyOk.and(lateOk)).toBe<'late', never>(true, 'late'),
      expectUnwrap(earlyOk.and(lateErr)).toBe<never, 'late'>(false, 'late'),
      expectUnwrap(earlyOk.and(asyncLateOk)).toBe<Promise<'late'>, Promise<never>>(true, 'late'),
      expectUnwrap(earlyOk.and(asyncLateErr)).toBe<Promise<never>, Promise<'late'>>(false, 'late'),
      expectUnwrap(earlyOk.and(okRes2)).toBe<'value2', 'error2'>(true, 'value2'),
      expectUnwrap(earlyOk.and(errRes2)).toBe<'value2', 'error2'>(false, 'error2'),

      expectUnwrap(earlyErr.and(lateOk)).toBe<never, 'early'>(false, 'early'),
      expectUnwrap(earlyErr.and(lateErr)).toBe<never, 'early'>(false, 'early'),
      expectUnwrap(earlyErr.and(asyncLateOk)).toBe<never, 'early'>(false, 'early'),
      expectUnwrap(earlyErr.and(asyncLateErr)).toBe<never, 'early'>(false, 'early'),
      expectUnwrap(earlyErr.and(okRes2)).toBe<never, 'early'>(false, 'early'),
      expectUnwrap(earlyErr.and(errRes2)).toBe<never, 'early'>(false, 'early'),

      expectUnwrap(asyncEarlyOk.and(lateOk)).toBe<Promise<'late'>, PN>(true, 'late'),
      expectUnwrap(asyncEarlyOk.and(lateErr)).toBe<Promise<'late'>, PN>(true, 'late'),
      expectUnwrap(asyncEarlyOk.and(asyncLateOk)).toBe<Promise<'late'>, PN>(true, 'late'),
      expectUnwrap(asyncEarlyOk.and(asyncLateErr)).toBe<Promise<'late'>, PN>(true, 'late'),
      expectUnwrap(asyncEarlyOk.and(okRes2)).toBe<Promise<'late'>, PN>(true, 'late'),
      expectUnwrap(asyncEarlyOk.and(errRes2)).toBe<Promise<'late'>, PN>(true, 'late'),

      expectUnwrap(okRes1.and(lateOk)).toBe<'late', 'error1'>(true, 'late'),
      expectUnwrap(okRes1.and(lateErr)).toBe<never, 'error1' | 'late'>(false, 'late'),
      expectUnwrap(okRes1.and(asyncLateOk)).toBe<Promise<'late'>, 'error1' | PN>(true, 'late'),
      expectUnwrap(okRes1.and(asyncLateErr)).toBe<PN, 'error1' | Promise<'late'>>(false, 'late'),
      expectUnwrap(okRes1.and(okRes2)).toBe<'value2', 'error1' | 'error2'>(true, 'value2'),
      expectUnwrap(okRes1.and(errRes2)).toBe<'value2', 'error1' | 'error2'>(false, 'error2'),

      expectUnwrap(errRes1.and(lateOk)).toBe<'late', 'error1'>(false, 'error1'),
      expectUnwrap(errRes1.and(lateErr)).toBe<never, 'error1' | 'late'>(false, 'error1'),
      expectUnwrap(errRes1.and(asyncLateOk)).toBe<Promise<'late'>, 'error1' | PN>(false, 'error1'),
      expectUnwrap(errRes1.and(asyncLateErr)).toBe<PN, 'error1' | Promise<'late'>>(false, 'error1'),
      expectUnwrap(errRes1.and(okRes2)).toBe<'value2', 'error1' | 'error2'>(false, 'error1'),
      expectUnwrap(errRes1.and(errRes2)).toBe<'value2', 'error1' | 'error2'>(false, 'error1'),
    ]);
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
