import { None, Some, none, some } from '../option';
import { isAnyOption } from '../option/util';
import { MaybePromise } from '../util';
import { AnyAsyncResult, AsyncErr, AsyncOk, AsyncResult } from './async-result';
import { ResultConstructor } from './result-constructor';
import { ResultMatch, isAnyResult } from './util';

export class Ok<T> implements ResultConstructor<T, { IsOk: true; IsAsync: false }> {
  protected _value: T;

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  get isOk(): true {
    return true;
  }

  get isErr(): false {
    return false;
  }

  isOkAnd<P extends MaybePromise<boolean>>(fn: (value: T) => P): P {
    return fn(this.value);
  }

  isErrAnd<P extends MaybePromise<boolean>>(_fn: (error: never) => P): false {
    return false;
  }

  inspect(fn: (value: T) => void): Ok<T> {
    fn(this.value);
    return this;
  }

  inspectErr(_fn: (error: never) => void): Ok<T> {
    return this;
  }

  expect(_message: string): T {
    return this.value;
  }

  expectErr(message: string): never {
    throw new Error(message);
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error(`Attempted to unwrapErr an 'ok' value: ${this.value}`);
  }

  unwrapOr<U>(_defaultValue: U): T {
    return this.value;
  }

  unwrapOrElse<U>(_fn: (error: never) => U): T {
    return this.value;
  }

  ok(): Some<T> {
    return some(this.value);
  }

  err(): None {
    return none;
  }

  transpose(): T extends None ? T : Some<Ok<T extends Some<infer TSome> ? TSome : T>> {
    type Cast = T extends None ? T : Some<Ok<T extends Some<infer TSome> ? TSome : T>>;

    const v = this.value;
    const isOption = isAnyOption(v);
    if (isOption && v.isNone) return v as Cast;
    return some(ok(isOption && v.isSome ? v.unwrap() : v)) as Cast;
  }

  flatten(): T extends AnyResult ? T : Ok<T> {
    type Cast = T extends AnyResult ? T : Ok<T>;

    const v = this.value;
    if (isAnyResult(v)) return v as Cast;
    return ok(v) as Cast;
  }

  map<U>(fn: (value: T) => U): U extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<U> {
    type Cast = U extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<U>;

    const mappedValue = fn(this.value);
    if (mappedValue instanceof Promise) return new AsyncResult(mappedValue.then(ok)) as Cast;
    return ok(mappedValue) as Cast;
  }

  mapErr<F>(_fn: (error: never) => F): Ok<T> {
    return this;
  }

  mapOr<U>(_defaultValue: U, fn: (value: T) => U): U {
    return fn(this.value);
  }

  mapOrElse<U>(_defaultFn: (error: never) => U, fn: (value: T) => U): U {
    return fn(this.value);
  }

  and<R extends AnyResult | AnyAsyncResult>(resB: R): R {
    return resB;
  }

  or<R extends AnyResult | AnyAsyncResult>(_resB: R): Ok<T> {
    return this;
  }

  andThen<R extends AnyResult>(fn: (value: T) => R): R {
    return fn(this.value);
  }

  orElse<R extends AnyResult>(_fn: (error: never) => R): Ok<T> {
    return this;
  }

  match<U>(m: ResultMatch<T, never, U>): U {
    return m.ok(this.value);
  }
}

export class Err<E> implements ResultConstructor<E, { IsOk: false; IsAsync: false }> {
  protected _error: E;

  constructor(error: E) {
    this._error = error;
  }

  get error(): E {
    return this._error;
  }

  get isOk(): false {
    return false;
  }

  get isErr(): true {
    return true;
  }

  isOkAnd<P extends MaybePromise<boolean>>(_fn: (value: never) => P): false {
    return false;
  }

  isErrAnd<P extends MaybePromise<boolean>>(fn: (error: E) => P): P {
    return fn(this.error);
  }

  inspect(_fn: (value: never) => void): Err<E> {
    return this;
  }

  inspectErr(fn: (error: E) => void): Err<E> {
    fn(this.error);
    return this;
  }

  expect(message: string): never {
    throw new Error(message);
  }

  expectErr(_message: string): E {
    return this.error;
  }

  unwrap(): never {
    throw new Error(`Attempted to unwrap an 'err' value: ${this.error}`);
  }

  unwrapErr(): E {
    return this.error;
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  unwrapOrElse<U>(fn: (error: E) => U): U {
    return fn(this.error);
  }

  ok(): None {
    return none;
  }

  err(): Some<E> {
    return some(this.error);
  }

  transpose(): Some<Err<E>> {
    return some(this);
  }

  flatten(): Err<E> {
    return this;
  }

  map<U>(_fn: (value: never) => U): Err<E> {
    return this;
  }

  mapErr<F>(fn: (error: E) => F): F extends Promise<infer TValue> ? AsyncErr<TValue> : Err<F> {
    type Cast = F extends Promise<infer TValue> ? AsyncErr<TValue> : Err<F>;

    const mappedError = fn(this.error);
    if (mappedError instanceof Promise) return new AsyncResult(mappedError.then(err)) as Cast;
    return err(mappedError) as Cast;
  }

  mapOr<U>(defaultValue: U, _fn: (value: never) => U): U {
    return defaultValue;
  }

  mapOrElse<U>(defaultFn: (error: E) => U, _fn: (value: never) => U): U {
    return defaultFn(this.error);
  }

  and<R extends AnyResult | AnyAsyncResult>(_resB: R): Err<E> {
    return this;
  }

  or<R extends AnyResult | AnyAsyncResult>(resB: R): R {
    return resB;
  }

  andThen<R extends AnyResult>(_fn: (value: never) => R): Err<E> {
    return this;
  }

  orElse<R extends AnyResult>(fn: (error: E) => R): R {
    return fn(this.error);
  }

  match<U>(m: ResultMatch<never, E, U>): U {
    return m.err(this.error);
  }
}

export type Result<T, E> = Ok<T> | Err<E>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyResult = Result<any, any>;

export function ok<T>(value: T): Ok<T> {
  return new Ok(value);
}

export function err<E>(error: E): Err<E> {
  return new Err(error);
}

export function result<T>(fn: () => T): Result<T, unknown> {
  try {
    const value = fn();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}
