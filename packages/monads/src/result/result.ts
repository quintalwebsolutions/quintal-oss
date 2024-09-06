import { type None, type Some, isAnyOption, none, some } from '../option';
import type { InferredValue, MaybePromise } from '../util';
import { type AsyncErr, type AsyncOk, AsyncResult } from './async-result';
import type { ResultConstructor } from './result-constructor';
import {
  type AnyResult,
  type AnySerializedResult,
  type ResultFromSerialized,
  type ResultMatch,
  type SerializedErr,
  type SerializedOk,
  isAnyResult,
} from './util';

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

  inspect(fn: (value: TValue) => MaybePromise<void>): Ok<TValue> {
    fn(this.value);
    return this;
  }

  inspectErr(_fn: (error: never) => MaybePromise<void>): Ok<TValue> {
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

  map<TMappedValue>(
    fn: (value: TValue) => TMappedValue,
  ): TMappedValue extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<TMappedValue> {
    // TODO achieve without cast?
    type Cast = TMappedValue extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<TMappedValue>;

    const mappedValue = fn(this.value);
    if (mappedValue instanceof Promise) return new AsyncResult(mappedValue.then(ok)) as Cast;
    return ok(mappedValue) as Cast;
  }

  mapErr<TMappedError>(_fn: (error: never) => TMappedError): Ok<TValue> {
    return this;
  }

  mapOr<TDefaultValue, TMappedValue>(
    _defaultValue: TDefaultValue,
    fn: (value: TValue) => TMappedValue,
  ): TMappedValue {
    return fn(this.value);
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    _defaultFn: (error: never) => TDefaultValue,
    fn: (value: TValue) => TMappedValue,
  ): TMappedValue {
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

  match<TOutputOk, TOutputErr>(m: ResultMatch<TValue, never, TOutputOk, TOutputErr>): TOutputOk {
    return m.ok(this.value);
  }

  serialize(): SerializedOk<TValue> {
    return {
      type: 'ok',
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

  inspect(_fn: (value: never) => MaybePromise<void>): Err<TError> {
    return this;
  }

  inspectErr(fn: (error: TError) => MaybePromise<void>): Err<TError> {
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

  map<TMappedValue>(_fn: (value: never) => TMappedValue): Err<TError> {
    return this;
  }

  mapErr<TMappedError>(
    fn: (error: TError) => TMappedError,
  ): TMappedError extends Promise<infer TValue> ? AsyncErr<TValue> : Err<TMappedError> {
    type Cast = TMappedError extends Promise<infer TValue> ? AsyncErr<TValue> : Err<TMappedError>;

    const mappedError = fn(this.error);
    if (mappedError instanceof Promise) return new AsyncResult(mappedError.then(err)) as Cast;
    return err(mappedError) as Cast;
  }

  mapOr<TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    _fn: (value: never) => TMappedValue,
  ): TDefaultValue {
    return defaultValue;
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    defaultFn: (error: TError) => TDefaultValue,
    _fn: (value: never) => TMappedValue,
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

  match<TOutputOk, TOutputErr>(m: ResultMatch<never, TError, TOutputOk, TOutputErr>): TOutputErr {
    return m.err(this.error);
  }

  serialize(): SerializedErr<TError> {
    return {
      type: 'err',
      error: this.error,
    };
  }
}

export type Result<TValue, TError> = Ok<TValue> | Err<TError>;

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

export function resultFromSerialized<TSerializedResult extends AnySerializedResult>(
  serializedResult: TSerializedResult,
): ResultFromSerialized<TSerializedResult> {
  if (serializedResult.type === 'ok')
    return ok(serializedResult.value) as ResultFromSerialized<TSerializedResult>;
  return err(serializedResult.error) as ResultFromSerialized<TSerializedResult>;
}

export function resultFromThrowable<TValue>(fn: () => TValue): Result<TValue, unknown> {
  try {
    const value = fn();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}
