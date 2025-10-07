import type { SimpleValue } from '../../util.ts';
import { AsyncResult } from '../AsyncResult.ts';
import { Err } from '../Err.ts';
import type { AsyncErr } from '../types.ts';

/** Utility function to create an `Err<TError>` result */
export function err<TError extends SimpleValue>(value: TError): Err<TError>;
export function err<TError>(error: TError): Err<TError>;
export function err<TError>(error: TError): Err<TError> {
  return new Err(error);
}

/** Utility function to create an `AsyncResult<Err<TError>>` result */
export function asyncErr<TError extends SimpleValue>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError> {
  return new AsyncResult(Promise.resolve(err(error)));
}
