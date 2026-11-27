import { AsyncResult } from '../AsyncResult.ts';
import type { Ok } from '../Ok.ts';
import {
  type AnyErr,
  type AnySyncResult,
  type ResultFromRecord,
  type ResultFromResults,
  type ResultInput,
  type ValueFromOk,
  isAnyAsyncResult,
} from '../types.ts';
import { ok } from './ok.ts';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value?.constructor === Object;
}

function combine(inputs: ResultInput[]) {
  const results = inputs.map((input) =>
    input instanceof Promise ? new AsyncResult(input) : input,
  );
  const firstErrorIndex = results.findIndex((result) => result.isErr);
  const firstError = results[firstErrorIndex];
  const firstAsyncIndex = results.findIndex((result) => isAnyAsyncResult(result));

  // All results are ok & sync
  if (firstErrorIndex === -1 && firstAsyncIndex === -1) {
    return ok(results.map((r) => r.unwrap()));
  }

  // All results are sync, but one is an error OR the first sync error is before the first async result
  if (firstError && (firstAsyncIndex === -1 || firstErrorIndex < firstAsyncIndex)) {
    return firstError;
  }

  // There is no easy sync error, but there are async results
  return new AsyncResult(
    Promise.all(results).then((resolvedResults) => {
      const firstResolvedError = resolvedResults.find((result) => result.isErr);
      return firstResolvedError ?? ok(resolvedResults.map((result) => result.unwrap()));
    }),
  );
}

/**
 * Create a result from multiple results, returning the first error (by position) if any.
 *
 * @example
 * resultFromResults(ok(1), ok(2)).unwrap(); // `[1, 2]`
 * resultFromResults(ok(1), ok(2), ok(3)).unwrap(); // `[1, 2, 3]`
 * await resultFromResults(ok(1), asyncOk(2), ok(3)).unwrap(); // `[1, 2, 3]`
 * await resultFromResults(ok(1), Promise.resolve(ok(2))).unwrap(); // `[1, 2]`
 * resultFromResults(ok(1), err(2), asyncErr(3)).unwrapErr(); // `2`
 * await resultFromResults(ok(1), asyncErr(2), err(3)).unwrapErr(); // `2`
 */
export function resultFromResults<
  TFirstResult extends ResultInput,
  TSecondResult extends ResultInput,
  TResultTail extends ResultInput[],
>(
  firstResult: TFirstResult,
  secondResult: TSecondResult,
  ...restResults: TResultTail
): ResultFromResults<[TFirstResult, TSecondResult, ...TResultTail]>;
/**
 * Create a result from a list of sync results of any length, returning the first error (by position) if any.
 *
 * To combine async results, wait for them first, e.g. with `await Promise.all(...)`.
 *
 * @example
 * resultFromResults([ok(1), ok(2), ok(3)]).unwrap(); // `[1, 2, 3]`
 * resultFromResults([]).unwrap(); // `[]`
 * resultFromResults([ok(1), err(2), err(3)]).unwrapErr(); // `2`
 * resultFromResults(await Promise.all(ids.map((id) => fetchUser(id)))); // `Result<User[], FetchError>`
 */
export function resultFromResults<TResults extends readonly AnySyncResult[]>(
  results: TResults,
): Ok<ValueFromOk<TResults[number]>[]> | Extract<TResults[number], AnyErr>;
/**
 * Create a result from a record of results, returning the first error (by key order) if any.
 *
 * A record with unknown keys can only hold sync results.
 *
 * @example
 * resultFromResults({ a: ok(1), b: ok('two') }).unwrap(); // `{ a: 1, b: 'two' }`
 * await resultFromResults({ a: ok(1), b: asyncOk('two') }).unwrap(); // `{ a: 1, b: 'two' }`
 * resultFromResults({ a: ok(1), b: err('failure') }).unwrapErr(); // `'failure'`
 * resultFromResults({}).unwrap(); // `{}`
 */
export function resultFromResults<TRecord extends Record<string, ResultInput>>(
  // A record with unknown keys can't tell whether it holds async results, so only sync results are allowed
  record: TRecord & (string extends keyof TRecord ? Record<keyof TRecord, AnySyncResult> : unknown),
): ResultFromRecord<TRecord>;
export function resultFromResults(first: unknown, second?: unknown, ...rest: unknown[]): unknown {
  if (Array.isArray(first)) return combine(first);

  if (isRecord(first)) {
    const keys = Object.keys(first);
    return combine(keys.map((key) => first[key] as ResultInput)).map((values) =>
      Object.fromEntries(keys.map((key, index) => [key, values[index]])),
    );
  }

  return combine([first, second, ...rest] as ResultInput[]);
}
