/* c8 ignore start */
// TODO remove ignore comment when this issue is resolved: https://github.com/vitest-dev/vitest/issues/3605

import { Err, Ok } from '../result';
import { Ternary } from '../util';
import { AnyOption, None, Some } from './option';

/** A type that represents either the presence or absence of a value */
export type OptionConstructor<TIsSome extends boolean, T> = {
  // Querying

  isSome: TIsSome;
  isNone: Ternary<TIsSome, false, true>;
  TernaryAnd: (fn: (value: T) => boolean) => boolean;
  inspect: (fn: (value: T) => void) => OptionConstructor<TIsSome, T>;

  // Extracting the contained value

  expect: (message: string) => T;
  unwrap: () => T;
  unwrapOr: <U>(defaultValue: U) => Ternary<TIsSome, T, U>;
  unwrapOrElse: <U>(fn: () => U) => Ternary<TIsSome, T, U>;

  // Transforming the contained value

  okOr: <E>(error: E) => Ternary<TIsSome, Ok<T>, Err<E>>;
  okOrElse: <E>(error: () => E) => Ternary<TIsSome, Ok<T>, Err<E>>;
  // TODO
  // transpose: ;
  // flatten: () => Option<T>;
  map: <U>(fn: (value: T) => U) => Ternary<TIsSome, Some<U>, None>;
  mapOr: <U>(defaultValue: U, fn: (value: T) => U) => U;
  mapOrElse: <U>(defaultFn: () => U, fn: (value: T) => U) => U;
  filter: <P extends boolean>(
    predicate: (value: T) => P,
  ) => Ternary<TIsSome, P extends true ? Some<T> : None, None>;
  // TODO `O extends AnyOption`? These can all be more typesafe
  // zip: <U>(other: Option<U>) => Option<[T, U]>;
  // zipWith: <U, R>(other: Option<U>, fn: (optA: T, optB: U) => R) => Option<R>;
  // unzip: ;

  // Boolean operators

  and: <O extends AnyOption>(opt: O) => Ternary<TIsSome, O, None>;
  or: <O extends AnyOption>(opt: O) => Ternary<TIsSome, Some<T>, O>;
  xor: <O extends AnyOption>(
    opt: O,
  ) => Ternary<TIsSome, Ternary<TIsSome, None, Some<T>>, Ternary<TIsSome, O, None>>;
  andThen: <O extends AnyOption>(fn: (value: T) => O) => Ternary<TIsSome, O, None>;
  orElse: <O extends AnyOption>(fn: () => O) => Ternary<TIsSome, Some<T>, O>;
};
