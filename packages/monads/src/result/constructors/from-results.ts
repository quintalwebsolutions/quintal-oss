import { AsyncResult } from '../AsyncResult.ts';
import { type AnyResult, type ResultFromResults, isAnyAsyncResult } from '../types.ts';
import { ok } from './ok.ts';

/**
 * Create a result from multiple results, returning the first error if any
 *
 * @example
 * resultFromResults(ok(1), ok(2)).unwrap(); // `[1, 2]`
 * resultFromResults(ok(1), ok(2), ok(3)).unwrap(); // `[1, 2, 3]`
 * await resultFromResults(ok(1), asyncOk(2), ok(3)).unwrap(); // `[1, 2, 3]`
 * resultFromResults(ok(1), err(2), asyncErr(3)).unwrapErr(); // `2`
 * await resultFromResults(ok(1), asyncErr(2), err(3)).unwrapErr(); // `2`
 */
export function resultFromResults<
  TFirstResult extends AnyResult,
  TSecondResult extends AnyResult,
  TResultTail extends AnyResult[],
>(firstResult: TFirstResult, secondResult: TSecondResult, ...restResults: TResultTail) {
  type Return = ResultFromResults<[TFirstResult, TSecondResult, ...TResultTail]>;

  const results = [firstResult, secondResult, ...restResults];
  const firstErrorIndex = results.findIndex((result) => result.isErr);
  const firstAsyncIndex = results.findIndex((result) => isAnyAsyncResult(result));

  // All results are ok & sync
  if (firstErrorIndex === -1 && firstAsyncIndex === -1) {
    return ok(results.map((r) => r.unwrap())) as Return;
  }

  // All results are sync, but one is an error OR the first sync error is before the first async result
  if (firstAsyncIndex === -1 || firstErrorIndex < firstAsyncIndex) {
    return results[firstErrorIndex] as Return;
  }

  // There is no easy sync error, but there are async results
  return new AsyncResult(
    Promise.all(results).then((resolvedResults) => {
      const firstError = resolvedResults.find((result) => result.isErr);
      return firstError ?? ok(resolvedResults.map((result) => result.unwrap()));
    }),
  ) as Return;
}
