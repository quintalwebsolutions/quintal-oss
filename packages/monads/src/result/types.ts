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
  TResults extends AnySyncResult[],
  TValues extends unknown[] = [],
> = TResults extends [infer THeadResult, ...infer TTailResults extends AnySyncResult[]]
  ? THeadResult extends Ok<infer TValue>
    ? ResultFromResults<TTailResults, [...TValues, TValue]>
    : THeadResult extends AnyErr
      ? THeadResult
      : never
  : Ok<TValues>;

export type ResultTernary<TResult, TIfOk, TIfErr> = TResult extends AnyOk ? TIfOk : TIfErr;

export type ValueFromOk<TOk> = TOk extends Ok<infer TValue> ? TValue : never;
export type ValueFromErr<TErr> = TErr extends Err<infer TError> ? TError : never;

export type ResultMatch<TValue, TError, TOutputOk, TOutputErr> = {
  ok: (value: TValue) => TOutputOk;
  err: (error: TError) => TOutputErr;
};

export type MaybePromise<TValue> = TValue | Promise<TValue>;
