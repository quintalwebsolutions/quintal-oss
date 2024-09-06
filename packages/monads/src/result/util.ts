import { AsyncResult } from './async-result';
import type { Result } from './result';
import { Err, Ok } from './result';

export type ResultMatch<TValue, TError, TOutputOk, TOutputErr> = {
  ok: (value: TValue) => TOutputOk;
  err: (error: TError) => TOutputErr;
};

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

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyResult = Result<any, any> | AsyncResult<any>;

export function isAnyResult<TResult>(res: TResult | AnyResult): res is AnyResult {
  return res instanceof Ok || res instanceof Err || res instanceof AsyncResult;
}
