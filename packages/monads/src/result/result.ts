import { type None, type Some, none, some } from '../option';
import { isAnyOption } from '../option';
import type { MaybePromise } from '../util';
import { type AsyncErr, type AsyncOk, AsyncResult } from './async-result';
import type { ResultConstructor } from './result-constructor';
import { type AnyResult, type ResultMatch, isAnyResult } from './util';

export class Ok<TValue> implements ResultConstructor<TValue, 'OK'> {
  protected _value: TValue;

  constructor(value: TValue) {
    this._value = value;
  }

  get value(): TValue {
    return this._value;
  }

  get isOk(): true {
    return true;
  }

  get isErr(): false {
    return false;
  }

  isOkAnd<TPredicate extends MaybePromise<boolean>>(fn: (value: TValue) => TPredicate): TPredicate {
    return fn(this.value);
  }

  isErrAnd<TPredicate extends MaybePromise<boolean>>(_fn: (error: never) => TPredicate): false {
    return false;
  }

  inspect(fn: (value: TValue) => void): Ok<TValue> {
    fn(this.value);
    return this;
  }

  inspectErr(_fn: (error: never) => void): Ok<TValue> {
    return this;
  }

  expect(_message: string): TValue {
    return this.value;
  }

  expectErr(message: string): never {
    throw new Error(message);
  }

  unwrap(): TValue {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error(`Attempted to unwrapErr an 'ok' value: ${this.value}`);
  }

  unwrapOr<TDefaultValue>(_defaultValue: TDefaultValue): TValue {
    return this.value;
  }

  unwrapOrElse<TDefaultValue>(_fn: (error: never) => TDefaultValue): TValue {
    return this.value;
  }

  ok(): Some<TValue> {
    return some(this.value);
  }

  err(): None {
    return none;
  }

  transpose(): TValue extends None
    ? TValue
    : Some<Ok<TValue extends Some<infer TSome> ? TSome : TValue>> {
    // TODO achieve without cast?
    type Cast = TValue extends None
      ? TValue
      : Some<Ok<TValue extends Some<infer TSome> ? TSome : TValue>>;

    const v = this.value;
    const isOption = isAnyOption(v);
    if (isOption && v.isNone) return v as Cast;
    return some(ok(isOption && v.isSome ? v.unwrap() : v)) as Cast;
  }

  flatten(): TValue extends AnyResult ? TValue : Ok<TValue> {
    // TODO achieve without cast?
    type Cast = TValue extends AnyResult ? TValue : Ok<TValue>;

    const v = this.value;
    if (isAnyResult(v)) return v as Cast;
    return ok(v) as Cast;
  }

  map<TNextValue>(
    fn: (value: TValue) => TNextValue,
  ): TNextValue extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<TNextValue> {
    // TODO achieve without cast?
    type Cast = TNextValue extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<TNextValue>;

    const mappedValue = fn(this.value);
    if (mappedValue instanceof Promise) return new AsyncResult(mappedValue.then(ok)) as Cast;
    return ok(mappedValue) as Cast;
  }

  mapErr<TNextError>(_fn: (error: never) => TNextError): Ok<TValue> {
    return this;
  }

  mapOr<TDefaultValue, TNextValue>(
    _defaultValue: TDefaultValue,
    fn: (value: TValue) => TNextValue,
  ): TNextValue {
    return fn(this.value);
  }

  mapOrElse<TDefaultValue, TNextValue>(
    _defaultFn: (error: never) => TDefaultValue,
    fn: (value: TValue) => TNextValue,
  ): TNextValue {
    return fn(this.value);
  }

  and<TResultB extends AnyResult>(resB: TResultB): TResultB {
    return resB;
  }

  or<TResultB extends AnyResult>(_resB: TResultB): Ok<TValue> {
    return this;
  }

  andThen<TResultB extends AnyResult>(fn: (value: TValue) => TResultB): TResultB {
    return fn(this.value);
  }

  orElse<TResultB extends AnyResult>(_fn: (error: never) => TResultB): Ok<TValue> {
    return this;
  }

  match<TOutput>(m: ResultMatch<TValue, never, TOutput>): TOutput {
    return m.ok(this.value);
  }

  serialize(): { isOk: true; isErr: false; value: TValue } {
    return {
      isOk: this.isOk,
      isErr: this.isErr,
      value: this.value,
    };
  }
}

export class Err<TError> implements ResultConstructor<TError, 'ERR'> {
  protected _error: TError;

  constructor(error: TError) {
    this._error = error;
  }

  get error(): TError {
    return this._error;
  }

  get isOk(): false {
    return false;
  }

  get isErr(): true {
    return true;
  }

  isOkAnd<TPredicate extends MaybePromise<boolean>>(_fn: (value: never) => TPredicate): false {
    return false;
  }

  isErrAnd<TPredicate extends MaybePromise<boolean>>(
    fn: (error: TError) => TPredicate,
  ): TPredicate {
    return fn(this.error);
  }

  inspect(_fn: (value: never) => void): Err<TError> {
    return this;
  }

  inspectErr(fn: (error: TError) => void): Err<TError> {
    fn(this.error);
    return this;
  }

  expect(message: string): never {
    throw new Error(message);
  }

  expectErr(_message: string): TError {
    return this.error;
  }

  unwrap(): never {
    throw new Error(`Attempted to unwrap an 'err' value: ${this.error}`);
  }

  unwrapErr(): TError {
    return this.error;
  }

  unwrapOr<TDefaultValue>(defaultValue: TDefaultValue): TDefaultValue {
    return defaultValue;
  }

  unwrapOrElse<TDefaultValue>(fn: (error: TError) => TDefaultValue): TDefaultValue {
    return fn(this.error);
  }

  ok(): None {
    return none;
  }

  err(): Some<TError> {
    return some(this.error);
  }

  transpose(): Some<Err<TError>> {
    return some(this);
  }

  flatten(): Err<TError> {
    return this;
  }

  map<TNextValue>(_fn: (value: never) => TNextValue): Err<TError> {
    return this;
  }

  mapErr<TNextError>(
    fn: (error: TError) => TNextError,
  ): TNextError extends Promise<infer TValue> ? AsyncErr<TValue> : Err<TNextError> {
    type Cast = TNextError extends Promise<infer TValue> ? AsyncErr<TValue> : Err<TNextError>;

    const mappedError = fn(this.error);
    if (mappedError instanceof Promise) return new AsyncResult(mappedError.then(err)) as Cast;
    return err(mappedError) as Cast;
  }

  mapOr<TDefaultValue, TNextValue>(
    defaultValue: TDefaultValue,
    _fn: (value: never) => TNextValue,
  ): TDefaultValue {
    return defaultValue;
  }

  mapOrElse<TDefaultValue, TNextValue>(
    defaultFn: (error: TError) => TDefaultValue,
    _fn: (value: never) => TNextValue,
  ): TDefaultValue {
    return defaultFn(this.error);
  }

  and<TResultB extends AnyResult>(_resB: TResultB): Err<TError> {
    return this;
  }

  or<TResultB extends AnyResult>(resB: TResultB): TResultB {
    return resB;
  }

  andThen<TResultB extends AnyResult>(_fn: (value: never) => TResultB): Err<TError> {
    return this;
  }

  orElse<TResultB extends AnyResult>(fn: (error: TError) => TResultB): TResultB {
    return fn(this.error);
  }

  match<TOutput>(m: ResultMatch<never, TError, TOutput>): TOutput {
    return m.err(this.error);
  }

  serialize(): { isOk: false; isErr: true; error: TError } {
    return {
      isOk: this.isOk,
      isErr: this.isErr,
      error: this.error,
    };
  }
}

export type Result<TValue, TError> = Ok<TValue> | Err<TError>;

export function ok<TValue>(value: TValue): Ok<TValue> {
  return new Ok(value);
}

export function err<TError>(error: TError): Err<TError> {
  return new Err(error);
}

export function result<TValue>(fn: () => TValue): Result<TValue, unknown> {
  try {
    const value = fn();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}
