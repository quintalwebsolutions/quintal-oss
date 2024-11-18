import { AsyncResult } from './AsyncResult';
import { Err } from './Err';
import { Ok } from './Ok';
import type {
  AnySerializedResult,
  AnySyncResult,
  AsyncErr,
  AsyncOk,
  Result,
  ResultFromResults,
  ResultFromSerialized,
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
 * Create a result from multiple resolved results
 *
 * @example
 * resultFromResults(ok(1), ok(2), ok(3)).unwrap(); // `[1, 2, 3]`
 * resultFromResults(ok(1), err(2), err(3)).unwrapErr(); // `2`
 */
export function resultFromResults<
  TFirstResult extends AnySyncResult,
  TSecondResult extends AnySyncResult,
  TResultTail extends AnySyncResult[],
>(firstResult: TFirstResult, secondResult: TSecondResult, ...restResults: TResultTail) {
  type Return = ResultFromResults<[TFirstResult, TSecondResult, ...TResultTail]>;

  const results = [firstResult, secondResult, ...restResults];
  const firstError = results.find((res) => res.isErr);
  if (firstError) return firstError as Return;

  const values = results.map((result) => result.unwrap());
  return ok(values) as Return;
}
