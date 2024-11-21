import { AsyncResult } from './AsyncResult';
import { Err } from './Err';
import { Ok } from './Ok';
import {
  type AnyResult,
  type AnySerializedResult,
  type AsyncErr,
  type AsyncOk,
  type Result,
  type ResultFromResults,
  type ResultFromSerialized,
  isAnyAsyncResult,
  isAnySyncResult,
} from './types';

type InferredResultValue = string | number | boolean;

/** Utility function to create an `Ok<TValue>` result */
export function ok<TValue extends InferredResultValue>(value: TValue): Ok<TValue>;
export function ok<TValue>(value: TValue): Ok<TValue>;
export function ok<TValue>(value: TValue): Ok<TValue> {
  return new Ok(value);
}

/** Utility function to create an `Err<TError>` result */
export function err<TError extends InferredResultValue>(value: TError): Err<TError>;
export function err<TError>(error: TError): Err<TError>;
export function err<TError>(error: TError): Err<TError> {
  return new Err(error);
}

/** Utility function to create an `AsyncResult<Ok<TValue>>` result */
export function asyncOk<TValue extends InferredResultValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue> {
  return new AsyncResult(Promise.resolve(ok(value)));
}

/** Utility function to create an `AsyncResult<Err<TError>>` result */
export function asyncErr<TError extends InferredResultValue>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError> {
  return new AsyncResult(Promise.resolve(err(error)));
}

/**
 * Create a result from its serialized form
 *
 * @example
 * resultFromSerialized({ type: 'ok', value: 1 }).unwrap(); // `1`
 * resultFromSerialized({ type: 'err', error: 'failure' }).unwrapErr(); // `'failure'`
 */
export function resultFromSerialized<TSerializedResult extends AnySerializedResult>(
  serializedResult: TSerializedResult,
): ResultFromSerialized<TSerializedResult> {
  if (serializedResult.type === 'ok')
    return ok(serializedResult.value) as ResultFromSerialized<TSerializedResult>;
  return err(serializedResult.error) as ResultFromSerialized<TSerializedResult>;
}

/**
 * Create an async result from its serialized form
 *
 * @example
 * await asyncResultFromSerialized(Promise.resolve({ type: 'ok', value: 1 })).unwrap(); // `1`
 * await asyncResultFromSerialized(Promise.resolve({ type: 'err', error: 'failure' })).unwrapErr(); // `'failure'`
 */
export function asyncResultFromSerialized<TSerializedResult extends AnySerializedResult>(
  serializedResult: Promise<TSerializedResult>,
): AsyncResult<ResultFromSerialized<TSerializedResult>> {
  return new AsyncResult(serializedResult.then((value) => resultFromSerialized(value)));
}

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
  const firstErrorIndex = results.findIndex((result) => isAnySyncResult(result) && result.isErr);
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
