import type { AnyOption, AsyncNone, AsyncSome, None, Some } from '../option/index.ts';
import type { Ternary } from '../util.ts';
import { AsyncResult } from './AsyncResult.ts';
import { Err } from './Err.ts';
import { Ok } from './Ok.ts';

export type Result<TValue, TError> = Ok<TValue> | Err<TError>;
export type AsyncResultOf<TValue, TError> = AsyncResult<Result<TValue, TError>>;
export type AsyncOk<TValue> = AsyncResult<Ok<TValue>>;
export type AsyncErr<TError> = AsyncResult<Err<TError>>;

// biome-ignore-start lint/suspicious/noExplicitAny: These types exist solely for generic parameters to extend
export type AnyOk = Ok<any>;
export type AnyAsyncOk = AsyncOk<any>;
export type AnyErr = Err<any>;
export type AnyAsyncErr = AsyncErr<any>;
// biome-ignore-end lint/suspicious/noExplicitAny: These types exist solely for generic parameters to extend

export type AnySyncResult = AnyOk | AnyErr;
export type AnyAsyncResult = AsyncResult<AnySyncResult>;
export type AnyResult = AnySyncResult | AnyAsyncResult;

export function isAnySyncResult<TResult>(res: TResult | AnySyncResult): res is AnySyncResult {
  return res instanceof Ok || res instanceof Err;
}

export function isAnyAsyncResult<TResult>(res: TResult | AnyAsyncResult): res is AnyAsyncResult {
  return res instanceof AsyncResult;
}

export function isAnyResult<TResult>(res: TResult | AnyResult): res is AnyResult {
  return isAnySyncResult(res) || isAnyAsyncResult(res);
}

export type SerializedOk<TValue> = {
  type: 'ok';
  value: TValue;
};

export type SerializedErr<TError> = {
  type: 'err';
  error: TError;
};

export type SerializedResult<TValue, TError> = SerializedOk<TValue> | SerializedErr<TError>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnySerializedResult = SerializedResult<any, any>;

export type ResultFromSerialized<TSerializedResult extends AnySerializedResult> =
  TSerializedResult extends SerializedOk<infer TValue>
    ? Ok<TValue>
    : TSerializedResult extends SerializedErr<infer TError>
      ? Err<TError>
      : never;

export type ResultInput = AnyResult | Promise<AnySyncResult>;

export type ResultFromResults<
  TResults extends ResultInput[],
  TIsAsync extends boolean = false,
  TValues extends unknown[] = [],
  TErrors extends unknown[] = [],
> = TResults extends [infer THead extends ResultInput, ...infer TTail extends ResultInput[]]
  ? THead extends Promise<infer TResult extends AnySyncResult>
    ? ResultFromResults<[AsyncResult<TResult>, ...TTail], TIsAsync, TValues, TErrors>
    : THead extends AnyAsyncErr
      ? [...TErrors, THead][number]
      : THead extends AnyErr
        ? [...TErrors, Ternary<TIsAsync, AsyncResult<THead>, THead>][number]
        : THead extends Ok<infer TValue>
          ? ResultFromResults<TTail, TIsAsync, [...TValues, TValue], TErrors>
          : THead extends AsyncOk<infer TValue>
            ? ResultFromResults<TTail, true, [...TValues, TValue], TErrors>
            : THead extends Result<infer TValue, infer TError>
              ? ResultFromResults<
                  TTail,
                  TIsAsync,
                  [...TValues, TValue],
                  [...TErrors, Ternary<TIsAsync, AsyncErr<TError>, Err<TError>>]
                >
              : THead extends AsyncResult<Result<infer TValue, infer TError>>
                ? ResultFromResults<
                    TTail,
                    true,
                    [...TValues, TValue],
                    [...TErrors, AsyncErr<TError>]
                  >
                : never
  : Ternary<TIsAsync, AsyncOk<TValues>, Ok<TValues>> | TErrors[number];

export type ResultFromRecord<TRecord extends Record<string, ResultInput>> =
  // The ok variant is impossible as soon as one of the values can't be ok
    | (true extends {
        [TKey in keyof TRecord]: [ValueFromOk<Awaited<TRecord[TKey]>>] extends [never]
          ? true
          : false;
      }[keyof TRecord]
        ? never
        : Ok<{ -readonly [TKey in keyof TRecord]: ValueFromOk<Awaited<TRecord[TKey]>> }>)
    | Extract<Awaited<TRecord[keyof TRecord]>, AnyErr> extends infer TResult extends AnySyncResult
    ? [Extract<TRecord[keyof TRecord], AnyAsyncResult | Promise<AnySyncResult>>] extends [never]
      ? TResult
      : AsyncResult<TResult>
    : never;

export type ResultTernary<TResult, TIfOk, TIfErr> = TResult extends AnyOk ? TIfOk : TIfErr;

/** The sync option that remains after transposing an `ok` result holding `TInner` */
export type TransposedOk<TInner> = TInner extends AnyOption
  ? TInner extends None | AsyncNone
    ? None
    : TInner extends Some<infer TSome>
      ? Some<Ok<TSome>>
      : TInner extends AsyncSome<infer TSome>
        ? Some<Ok<TSome>>
        : never
  : Some<Ok<TInner>>;

/** The sync result that remains after flattening a (possibly async) inner result */
export type FlattenedResult<TInner> = TInner extends AsyncResult<infer TSyncResult>
  ? TSyncResult
  : TInner extends AnySyncResult
    ? TInner
    : Ok<TInner>;

export type ValueFromOk<TOk> = TOk extends Ok<infer TValue> ? TValue : never;
export type ValueFromErr<TErr> = TErr extends Err<infer TError> ? TError : never;

export type ResultMatch<TValue, TError, TOutputOk, TOutputErr> = {
  ok: (value: TValue) => TOutputOk;
  err: (error: TError) => TOutputErr;
};
