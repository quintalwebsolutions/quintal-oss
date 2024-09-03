import { AsyncResult } from './async-result';
import type { Result } from './result';
import { Err, Ok } from './result';

export type ResultMatch<TValue, TError, TOutput> = {
  ok: (value: TValue) => TOutput;
  err: (error: TError) => TOutput;
};

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyResult = Result<any, any> | AsyncResult<any>;

export function isAnyResult<T>(res: T | AnyResult): res is AnyResult {
  return res instanceof Ok || res instanceof Err || res instanceof AsyncResult;
}
