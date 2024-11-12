import { none, some } from '..';
import { AsyncResult } from './AsyncResult';
import type { ResultDocs } from './ResultDocs';
import { err } from './constructors';
import type { AnyResult, AsyncErr, MaybePromise, ResultMatch, SerializedErr } from './types';

export class Err<TError> implements ResultDocs<TError, 'err'> {
  private _error: TError;

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
    return none();
  }

  err() {
    return some(this.error);
  }

  // TODO transpose
  // transpose(): Some<Err<TError>> {
  //   return some(this);
  // }

  // TODO flatten
  // flatten(): Err<TError> {
  //   return this;
  // }

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

  and<TResultB extends AnyResult>(_resultB: TResultB) {
    return this;
  }

  or<TResultB extends AnyResult>(resultB: TResultB) {
    return resultB;
  }

  andThen<TResultB extends AnyResult>(_fn: (value: never) => TResultB) {
    return this;
  }

  orElse<TResultB extends AnyResult>(fn: (error: TError) => TResultB) {
    return fn(this.error);
  }

  match<TOutputOk, TOutputErr>(match: ResultMatch<never, TError, TOutputOk, TOutputErr>) {
    return match.err(this.error);
  }

  serialize() {
    return { type: 'err', error: this.error } satisfies SerializedErr<TError>;
  }

  // TODO merge
  // merge<TResultB extends AnyResult>(_resultB: TResultB): Err<TError> {
  //   return this;
  // }
}
