import type { SimpleValue } from '../../util.ts';
import { AsyncResult } from '../AsyncResult.ts';
import { Ok } from '../Ok.ts';
import type { AsyncOk } from '../types.ts';

/** Utility function to create an `Ok<TValue>` result */
export function ok<TValue extends SimpleValue>(value: TValue): Ok<TValue>;
export function ok<TValue>(value: TValue): Ok<TValue>;
export function ok<TValue>(value: TValue): Ok<TValue> {
  return new Ok(value);
}

/** Utility function to create an `AsyncResult<Ok<TValue>>` result */
export function asyncOk<TValue extends SimpleValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue> {
  return new AsyncResult(Promise.resolve(ok(value)));
}
