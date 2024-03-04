import { Err, Ok, err, ok } from '../result';
import { MaybePromise, Ternary } from '../util';
import { OptionConstructor } from './option-constructor';
import { AnyOption, OptionMatch } from './util';

export class Some<T> implements OptionConstructor<T, 'SOME'> {
  protected _value: T;

  constructor(value: T) {
    this._value = value;
  }

  get value(): T {
    return this._value;
  }

  get isSome(): true {
    return true;
  }

  get isNone(): false {
    return false;
  }

  isSomeAnd<P extends MaybePromise<boolean>>(fn: (value: T) => P): P {
    return fn(this.value);
  }

  inspect(fn: (value: T) => void): Some<T> {
    fn(this.value);
    return this;
  }

  expect(_message: string): T {
    return this.value;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr<U>(_defaultValue: U): T {
    return this.value;
  }

  unwrapOrElse<U>(_fn: () => U): T {
    return this.value;
  }

  okOr<E>(_error: E): Ok<T> {
    return ok(this.value);
  }

  okOrElse<E>(_errorFn: () => E): Ok<T> {
    return ok(this.value);
  }

  map<U>(fn: (value: T) => U): Some<U> {
    return some(fn(this.value));
  }

  mapOr<D, U>(_defaultValue: D, fn: (value: T) => U): U {
    return fn(this.value);
  }

  mapOrElse<D, U>(_defaultFn: () => D, fn: (value: T) => U): U {
    return fn(this.value);
  }

  filter<P extends boolean>(predicate: (value: T) => P): P extends true ? Some<T> : None {
    // TODO achieve without cast?
    type Cast = ReturnType<typeof predicate> extends true ? Some<T> : None;

    return (predicate(this.value) ? this : none) as Cast;
  }

  and<O extends AnyOption>(opt: O): O {
    return opt;
  }

  or<O extends AnyOption>(_opt: O): Some<T> {
    return this;
  }

  xor<O extends AnyOption>(opt: O): Ternary<O['isSome'], None, Some<T>> {
    // TODO achieve without cast
    type Cast = Ternary<(typeof opt)['isSome'], None, Some<T>>;

    return (opt.isSome ? none : this) as Cast;
  }

  andThen<O extends AnyOption>(fn: (value: T) => O): O {
    return fn(this.value);
  }

  orElse<O extends AnyOption>(_fn: () => O): Some<T> {
    return this;
  }

  match<U>(m: OptionMatch<T, U>): U {
    return m.some(this.value);
  }
}

export class None implements OptionConstructor<never, 'NONE'> {
  get isSome(): false {
    return false;
  }

  get isNone(): true {
    return true;
  }

  isSomeAnd<P extends MaybePromise<boolean>>(_fn: (value: never) => P): false {
    return false;
  }

  inspect(_fn: (value: never) => void): None {
    return this;
  }

  expect(message: string): never {
    throw new Error(message);
  }

  unwrap(): never {
    throw new Error(`Attempted to unwrap a 'none' value`);
  }

  unwrapOr<U>(defaultValue: U): U {
    return defaultValue;
  }

  unwrapOrElse<U>(fn: () => U): U {
    return fn();
  }

  okOr<E>(error: E): Err<E> {
    return err(error);
  }

  okOrElse<E>(errorFn: () => E): Err<E> {
    return err(errorFn());
  }

  map<U>(_fn: (value: never) => U): None {
    return this;
  }

  mapOr<D, U>(defaultValue: D, _fn: (value: never) => U): D {
    return defaultValue;
  }

  mapOrElse<D, U>(defaultFn: () => D, _fn: (value: never) => U): D {
    return defaultFn();
  }

  filter<P extends boolean>(_predicate: (value: never) => P): None {
    return this;
  }

  and<O extends AnyOption>(_opt: O): None {
    return this;
  }

  or<O extends AnyOption>(opt: O): O {
    return opt;
  }

  xor<O extends AnyOption>(opt: O): Ternary<O['isSome'], O, None> {
    // TODO achieve without cast
    type Cast = Ternary<(typeof opt)['isSome'], typeof opt, None>;

    return (opt.isSome ? opt : none) as Cast;
  }

  andThen<O extends AnyOption>(_fn: (value: never) => O): None {
    return this;
  }

  orElse<O extends AnyOption>(fn: () => O): O {
    return fn();
  }

  match<U>(m: OptionMatch<never, U>): U {
    return m.none();
  }
}

export type Option<T> = Some<T> | None;

export function some<T>(value: T): Some<T> {
  return new Some(value);
}

export const none = new None();
