import { none, some } from '../option/index.ts';
import type { MaybePromise } from '../util.ts';
import { AsyncResult } from './AsyncResult.ts';
import { err } from './constructors/err.ts';
import type { ResultDocs } from './ResultDocs.ts';
import type { AnyResult, AnySyncResult, AsyncErr, ResultMatch, SerializedErr } from './types.ts';

export class Err<TError> implements ResultDocs<TError, 'err'> {
  private readonly _error: TError;

  constructor(error: TError) {
    this._error = error;
  }

  get error() {
    return this._error;
  }

  get isOk() {
    return false as const;
  }

  get isErr() {
    return true as const;
  }

  isOkAnd<TPredicate extends MaybePromise<boolean>>(_fn: (value: never) => TPredicate) {
    return false as const;
  }

  isErrAnd<TPredicate extends MaybePromise<boolean>>(fn: (error: TError) => TPredicate) {
    return fn(this.error);
  }

  inspect(_fn: (value: never) => MaybePromise<void>) {
    return this;
  }

  inspectErr(fn: (error: TError) => MaybePromise<void>) {
    fn(this.error);
    return this;
  }

  expect(message: string): never {
    throw new Error(message);
  }

  expectErr(_message: string) {
    return this.error;
  }

  unwrap(): never {
    throw new Error(`Attempted to unwrap an Err value: ${this.error}`);
  }

  unwrapErr() {
    return this.error;
  }

  unwrapOr<TDefaultValue>(defaultValue: TDefaultValue) {
    return defaultValue;
  }

  unwrapOrElse<TDefaultValue>(fn: (error: TError) => TDefaultValue) {
    return fn(this.error);
  }

  ok() {
    return none;
  }

  err() {
    return some(this.error);
  }

  transpose() {
    return some(this);
  }

  flatten() {
    return this;
  }

  map<TMappedValue>(_fn: (value: never) => TMappedValue) {
    return this;
  }

  mapErr<TMappedError>(fn: (error: TError) => TMappedError) {
    type Return = TMappedError extends Promise<infer TAwaitedMappedError>
      ? AsyncErr<TAwaitedMappedError>
      : Err<TMappedError>;
    const mappedError = fn(this.error);
    if (mappedError instanceof Promise) return new AsyncResult(mappedError.then(err)) as Return;
    return err(mappedError) as Return;
  }

  mapOr<TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    _fn: (value: never) => TMappedValue,
  ) {
    return defaultValue;
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    defaultFn: (error: TError) => TDefaultValue,
    _fn: (value: never) => TMappedValue,
  ) {
    return defaultFn(this.error);
  }

  and<TResultB extends AnyResult | Promise<AnySyncResult>>(_resultB: TResultB) {
    return this;
  }

  or<TResultB extends AnyResult | Promise<AnySyncResult>>(resultB: TResultB) {
    type Return = TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
      ? AsyncResult<TInternalResultB>
      : TResultB;
    if (resultB instanceof Promise) return new AsyncResult(resultB) as Return;
    return resultB as Return;
  }

  andThen<TResultB extends AnyResult | Promise<AnySyncResult>>(_fn: (value: never) => TResultB) {
    return this;
  }

  orElse<TResultB extends AnyResult | Promise<AnySyncResult>>(fn: (error: TError) => TResultB) {
    type Return = TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
      ? AsyncResult<TInternalResultB>
      : TResultB;
    const result = fn(this.error);
    if (result instanceof Promise) return new AsyncResult(result) as Return;
    return result as Return;
  }

  match<TOutputOk, TOutputErr>(match: ResultMatch<never, TError, TOutputOk, TOutputErr>) {
    return match.err(this.error);
  }

  serialize() {
    return { type: 'err', error: this.error } satisfies SerializedErr<TError>;
  }
}
