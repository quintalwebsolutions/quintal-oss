import { AsyncResult } from '../AsyncResult.ts';
import type { Result } from '../types.ts';
import { err } from './err.ts';
import { ok } from './ok.ts';

/**
 * Create a result from a function that may throw
 *
 * @example
 * const result = resultFromThrowable(() => {
 *  if (Math.random() > 0.5) return true;
 *  throw new Error('failure');
 * }); // `result` is of type `Result<boolean, unknown>`
 */
export function resultFromThrowable<TValue>(fn: () => TValue): Result<TValue, unknown> {
  try {
    return ok(fn());
  } catch (e) {
    return err(e);
  }
}

/**
 * Create an async result from an async function that may throw
 *
 * @example
 * const result = asyncResultFromThrowable(async () => {
 *  if (await Promise.resolve(Math.random()) > 0.5) return true;
 *  throw new Error('failure');
 * }); // `result` is of type `AsyncResult<Result<boolean, unknown>>`
 */
export function asyncResultFromThrowable<TValue>(
  fn: () => Promise<TValue>,
): AsyncResult<Result<TValue, unknown>> {
  return new AsyncResult(
    fn()
      .then((value) => ok(value))
      .catch((error) => err(error)),
  );
}
