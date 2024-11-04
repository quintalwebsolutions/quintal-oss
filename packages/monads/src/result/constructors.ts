import { AsyncResult } from './AsyncResult';
import { Err } from './Err';
import { Ok } from './Ok';
import type { AnySerializedResult, AsyncErr, AsyncOk, Result, ResultFromSerialized } from './types';

type InferredValue = string | number | boolean;

export function ok<TValue extends InferredValue>(value: TValue): Ok<TValue>;
export function ok<TValue>(value: TValue): Ok<TValue>;
export function ok<TValue>(value: TValue): Ok<TValue> {
  return new Ok(value);
}

export function err<TError extends InferredValue>(value: TError): Err<TError>;
export function err<TError>(error: TError): Err<TError>;
export function err<TError>(error: TError): Err<TError> {
  return new Err(error);
}

export function asyncOk<TValue extends InferredValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue> {
  return new AsyncResult(Promise.resolve(ok(value)));
}

export function asyncErr<TError extends InferredValue>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError> {
  return new AsyncResult(Promise.resolve(err(error)));
}

export function resultFromSerialized<TSerializedResult extends AnySerializedResult>(
  serializedResult: TSerializedResult,
): ResultFromSerialized<TSerializedResult> {
  if (serializedResult.type === 'ok')
    return ok(serializedResult.value) as ResultFromSerialized<TSerializedResult>;
  return err(serializedResult.error) as ResultFromSerialized<TSerializedResult>;
}

export function asyncResultFromSerialized<TSerializedResult extends AnySerializedResult>(
  serializedResult: Promise<TSerializedResult>,
): AsyncResult<ResultFromSerialized<TSerializedResult>> {
  return new AsyncResult(serializedResult.then((value) => resultFromSerialized(value)));
}

export function resultFromThrowable<TValue>(fn: () => TValue): Result<TValue, unknown> {
  try {
    return ok(fn());
  } catch (e) {
    return err(e);
  }
}

export function asyncResultFromThrowable<TValue>(
  fn: () => Promise<TValue>,
): AsyncResult<Result<TValue, unknown>> {
  return new AsyncResult(
    fn()
      .then((value) => ok(value))
      .catch((error) => err(error)),
  );
}

// TODO
// export function resultFromResults
