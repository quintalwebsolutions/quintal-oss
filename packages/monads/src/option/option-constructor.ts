/* c8 ignore start */
// TODO remove ignore comment when this issue is resolved: https://github.com/vitest-dev/vitest/issues/3605

import { Err, Ok } from '../result';
import { MaybePromise, Ternary } from '../util';
import { None, Some } from './option';
import { AnyOption, OptionMatch } from './util';

// TODO ASYNC variant to share docs?
type Variant = 'SOME' | 'NONE';
type Eval<V extends Variant, TIsSome, TIsNone> = V extends 'SOME'
  ? TIsSome
  : V extends 'NONE'
    ? TIsNone
    : never;

type Value<T, V extends Variant> = V extends 'SOME' ? T : never;

// TODO docs
/** A data structure that represents either the presence or the absence of a value */
export type OptionConstructor<T, V extends Variant> = {
  // Querying

  isSome: Eval<V, true, false>;
  isNone: Eval<V, false, true>;
  isSomeAnd: <P extends MaybePromise<boolean>>(fn: (value: Value<T, V>) => P) => Eval<V, P, false>;
  inspect: (fn: (value: Value<T, V>) => void) => OptionConstructor<T, V>;

  // Extracting the contained value

  expect: (message: string) => Value<T, V>;
  unwrap: () => Value<T, V>;
  unwrapOr: <U>(defaultValue: U) => Eval<V, T, U>;
  unwrapOrElse: <U>(fn: () => U) => Eval<V, T, U>;

  // Transforming the contained value

  okOr: <E>(error: E) => Eval<V, Ok<T>, Err<E>>;
  okOrElse: <E>(errorFn: () => E) => Eval<V, Ok<T>, Err<E>>;
  // TODO
  // transpose: ;
  // flatten: ;
  // TODO allow promises => AsyncOption
  map: <U>(fn: (value: Value<T, V>) => U) => Eval<V, Some<U>, None>;
  mapOr: <D, U>(defaultValue: D, fn: (value: Value<T, V>) => U) => Eval<V, U, D>;
  mapOrElse: <D, U>(defaultFn: () => D, fn: (value: Value<T, V>) => U) => Eval<V, U, D>;
  filter: <P extends boolean>(
    predicate: (value: Value<T, V>) => P,
  ) => Eval<V, P extends true ? Some<T> : None, None>;
  // TODO `O extends AnyOption`? These can all be more typesafe
  // zip: <U>(other: Option<U>) => Option<[T, U]>;
  // zipWith: <U, R>(other: Option<U>, fn: (optA: T, optB: U) => R) => Option<R>;
  // unzip: ;

  // Boolean operators

  and: <O extends AnyOption>(opt: O) => Eval<V, O, None>;
  or: <O extends AnyOption>(opt: O) => Eval<V, Some<T>, O>;
  xor: <O extends AnyOption>(
    opt: O,
  ) => Eval<V, Ternary<O['isSome'], None, Some<T>>, Ternary<O['isSome'], O, None>>;
  andThen: <O extends AnyOption>(fn: (value: T) => O) => Eval<V, O, None>;
  orElse: <O extends AnyOption>(fn: () => O) => Eval<V, Some<T>, O>;

  // Rust syntax utilities

  match: <U>(m: OptionMatch<Value<T, V>, U>) => U;
};
