import { type Err, type Ok, err, ok } from '../result';
import type { MaybePromise, Ternary } from '../util';
import type { OptionConstructor } from './option-constructor';
import type { AnyOption, OptionMatch } from './util';

export class Some<TValue> implements OptionConstructor<TValue, 'SOME'> {
  protected _value: TValue;

  constructor(value: TValue) {
    this._value = value;
  }

  get value(): TValue {
    return this._value;
  }

  get isSome(): true {
    return true;
  }

  get isNone(): false {
    return false;
  }

  isSomeAnd<TPredicate extends MaybePromise<boolean>>(
    fn: (value: TValue) => TPredicate,
  ): TPredicate {
    return fn(this.value);
  }

  inspect(fn: (value: TValue) => void): Some<TValue> {
    fn(this.value);
    return this;
  }

  expect(_message: string): TValue {
    return this.value;
  }

  unwrap(): TValue {
    return this.value;
  }

  unwrapOr<TDefaultValue>(_defaultValue: TDefaultValue): TValue {
    return this.value;
  }

  unwrapOrElse<TDefaultValue>(_fn: () => TDefaultValue): TValue {
    return this.value;
  }

  okOr<TError>(_error: TError): Ok<TValue> {
    return ok(this.value);
  }

  okOrElse<TError>(_errorFn: () => TError): Ok<TValue> {
    return ok(this.value);
  }

  map<TMappedValue>(fn: (value: TValue) => TMappedValue): Some<TMappedValue> {
    return some(fn(this.value));
  }

  mapOr<TDefaultValue, TMappedValue>(
    _defaultValue: TDefaultValue,
    fn: (value: TValue) => TMappedValue,
  ): TMappedValue {
    return fn(this.value);
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    _defaultFn: () => TDefaultValue,
    fn: (value: TValue) => TMappedValue,
  ): TMappedValue {
    return fn(this.value);
  }

  filter<TPredicate extends boolean>(
    predicate: (value: TValue) => TPredicate,
  ): TPredicate extends true ? Some<TValue> : None {
    // TODO achieve without cast?
    type Cast = ReturnType<typeof predicate> extends true ? Some<TValue> : None;

    return (predicate(this.value) ? this : none) as Cast;
  }

  and<TOptionB extends AnyOption>(opt: TOptionB): TOptionB {
    return opt;
  }

  or<TOptionB extends AnyOption>(_opt: TOptionB): Some<TValue> {
    return this;
  }

  xor<TOptionB extends AnyOption>(opt: TOptionB): Ternary<TOptionB['isSome'], None, Some<TValue>> {
    // TODO achieve without cast
    type Cast = Ternary<(typeof opt)['isSome'], None, Some<TValue>>;

    return (opt.isSome ? none : this) as Cast;
  }

  andThen<TOptionB extends AnyOption>(fn: (value: TValue) => TOptionB): TOptionB {
    return fn(this.value);
  }

  orElse<TOptionB extends AnyOption>(_fn: () => TOptionB): Some<TValue> {
    return this;
  }

  match<TOutput>(m: OptionMatch<TValue, TOutput>): TOutput {
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

  isSomeAnd<TPredicate extends MaybePromise<boolean>>(_fn: (value: never) => TPredicate): false {
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

  unwrapOr<TDefaultValue>(defaultValue: TDefaultValue): TDefaultValue {
    return defaultValue;
  }

  unwrapOrElse<TDefaultValue>(fn: () => TDefaultValue): TDefaultValue {
    return fn();
  }

  okOr<TError>(error: TError): Err<TError> {
    return err(error);
  }

  okOrElse<TError>(errorFn: () => TError): Err<TError> {
    return err(errorFn());
  }

  map<TMappedValue>(_fn: (value: never) => TMappedValue): None {
    return this;
  }

  mapOr<TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    _fn: (value: never) => TMappedValue,
  ): TDefaultValue {
    return defaultValue;
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    defaultFn: () => TDefaultValue,
    _fn: (value: never) => TMappedValue,
  ): TDefaultValue {
    return defaultFn();
  }

  filter<TPredicate extends boolean>(_predicate: (value: never) => TPredicate): None {
    return this;
  }

  and<TOptionB extends AnyOption>(_opt: TOptionB): None {
    return this;
  }

  or<TOptionB extends AnyOption>(opt: TOptionB): TOptionB {
    return opt;
  }

  xor<TOptionB extends AnyOption>(opt: TOptionB): Ternary<TOptionB['isSome'], TOptionB, None> {
    // TODO achieve without cast
    type Cast = Ternary<(typeof opt)['isSome'], typeof opt, None>;

    return (opt.isSome ? opt : none) as Cast;
  }

  andThen<TOption extends AnyOption>(_fn: (value: never) => TOption): None {
    return this;
  }

  orElse<TOption extends AnyOption>(fn: () => TOption): TOption {
    return fn();
  }

  match<TOutput>(m: OptionMatch<never, TOutput>): TOutput {
    return m.none();
  }
}

export type Option<TValue> = Some<TValue> | None;

export function some<TValue>(value: TValue): Some<TValue> {
  return new Some(value);
}

export const none = new None();
