import { AnyResult, Err, Ok } from './result';

export type Match<T, E, U> = {
  ok: (value: T) => U;
  err: (error: E) => U;
};

export function isAnyResult<T>(res: T | AnyResult): res is AnyResult {
  return res instanceof Ok || res instanceof Err;
}
