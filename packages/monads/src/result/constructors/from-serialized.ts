import { AsyncResult } from '../AsyncResult.ts';
import type { AnySerializedResult, ResultFromSerialized } from '../types.ts';
import { err } from './err.ts';
import { ok } from './ok.ts';

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
