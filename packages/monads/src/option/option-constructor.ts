/* c8 ignore start */

import type { Err, Ok } from '../result';
import type { MaybePromise, Ternary } from '../util';
import type { None, Some } from './option';
import type { AnyOption, OptionMatch } from './util';

type Variant = 'SOME' | 'NONE';
type Eval<TVariant extends Variant, TIsSome, TIsNone> = TVariant extends 'SOME'
  ? TIsSome
  : TVariant extends 'NONE'
    ? TIsNone
    : never;

type Value<TValue, TVariant extends Variant> = TVariant extends 'SOME' ? TValue : never;

// TODO docs
/** A data structure that represents either the presence or the absence of a value */
export type OptionConstructor<TValue, TVariant extends Variant> = {
  // Querying

  isSome: Eval<TVariant, true, false>;
  isNone: Eval<TVariant, false, true>;
  isSomeAnd: <TPredicate extends MaybePromise<boolean>>(
    fn: (value: Value<TValue, TVariant>) => TPredicate,
  ) => Eval<TVariant, TPredicate, false>;
  inspect: (fn: (value: Value<TValue, TVariant>) => void) => OptionConstructor<TValue, TVariant>;

  // Extracting the contained value

  expect: (message: string) => Value<TValue, TVariant>;
  unwrap: () => Value<TValue, TVariant>;
  unwrapOr: <TDefaultValue>(defaultValue: TDefaultValue) => Eval<TVariant, TValue, TDefaultValue>;
  unwrapOrElse: <TDefaultValue>(fn: () => TDefaultValue) => Eval<TVariant, TValue, TDefaultValue>;

  // Transforming the contained value

  okOr: <TError>(error: TError) => Eval<TVariant, Ok<TValue>, Err<TError>>;
  okOrElse: <TError>(errorFn: () => TError) => Eval<TVariant, Ok<TValue>, Err<TError>>;
  // TODO
  // transpose: ;
  // flatten: ;
  // TODO allow promises => AsyncOption
  map: <TNextValue>(
    fn: (value: Value<TValue, TVariant>) => TNextValue,
  ) => Eval<TVariant, Some<TNextValue>, None>;
  mapOr: <TDefaultValue, TNextValue>(
    defaultValue: TDefaultValue,
    fn: (value: Value<TValue, TVariant>) => TNextValue,
  ) => Eval<TVariant, TNextValue, TDefaultValue>;
  mapOrElse: <TDefaultValue, TNextValue>(
    defaultFn: () => TDefaultValue,
    fn: (value: Value<TValue, TVariant>) => TNextValue,
  ) => Eval<TVariant, TNextValue, TDefaultValue>;
  filter: <TPredicate extends boolean>(
    predicate: (value: Value<TValue, TVariant>) => TPredicate,
  ) => Eval<TVariant, TPredicate extends true ? Some<TValue> : None, None>;
  // TODO `O extends AnyOption`? These can all be more typesafe
  // zip: <U>(other: Option<U>) => Option<[T, U]>;
  // zipWith: <U, R>(other: Option<U>, fn: (optA: T, optB: U) => R) => Option<R>;
  // unzip: ;

  // Boolean operators

  and: <TOptionB extends AnyOption>(opt: TOptionB) => Eval<TVariant, TOptionB, None>;
  or: <TOptionB extends AnyOption>(opt: TOptionB) => Eval<TVariant, Some<TValue>, TOptionB>;
  xor: <TOptionB extends AnyOption>(
    opt: TOptionB,
  ) => Eval<
    TVariant,
    Ternary<TOptionB['isSome'], None, Some<TValue>>,
    Ternary<TOptionB['isSome'], TOptionB, None>
  >;
  andThen: <TOptionB extends AnyOption>(
    fn: (value: TValue) => TOptionB,
  ) => Eval<TVariant, TOptionB, None>;
  orElse: <TOptionB extends AnyOption>(
    fn: () => TOptionB,
  ) => Eval<TVariant, Some<TValue>, TOptionB>;

  // Rust syntax utilities

  match: <TOutput>(m: OptionMatch<Value<TValue, TVariant>, TOutput>) => TOutput;
};
