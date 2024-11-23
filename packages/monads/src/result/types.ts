import type { Ternary } from '../util';
import { AsyncResult } from './AsyncResult';
import { Err } from './Err';
import { Ok } from './Ok';

export type Result<TValue, TError> = Ok<TValue> | Err<TError>;
export type AsyncOk<TValue> = AsyncResult<Ok<TValue>>;
export type AsyncErr<TError> = AsyncResult<Err<TError>>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyOk = Ok<any>;
// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyAsyncOk = AsyncOk<any>;
// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyErr = Err<any>;
// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyAsyncErr = AsyncErr<any>;

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

export type ResultFromResults<
  TResults extends AnyResult[],
  TIsAsync extends boolean = false,
  TValues extends unknown[] = [],
  TErrors extends unknown[] = [],
> = TResults extends [infer THead extends AnyResult, ...infer TTail extends AnyResult[]]
  ? THead extends AnyAsyncErr
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
              ? ResultFromResults<TTail, true, [...TValues, TValue], [...TErrors, AsyncErr<TError>]>
              : never
  : Ternary<TIsAsync, AsyncOk<TValues>, Ok<TValues>> | TErrors[number];

export type ResultTernary<TResult, TIfOk, TIfErr> = TResult extends AnyOk ? TIfOk : TIfErr;

export type ValueFromOk<TOk> = TOk extends Ok<infer TValue> ? TValue : never;
export type ValueFromErr<TErr> = TErr extends Err<infer TError> ? TError : never;

export type ResultMatch<TValue, TError, TOutputOk, TOutputErr> = {
  ok: (value: TValue) => TOutputOk;
  err: (error: TError) => TOutputErr;
};
