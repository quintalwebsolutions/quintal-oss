import type { Err, Ok } from '../result';
import type { MaybePromise, Ternary } from '../util';
import type { None, Some } from './option';
import type { AnyOption, OptionMatch } from './util';

type Variant = 'SOME' | 'NONE';
type EvaluateVariant<TVariant extends Variant, TIsSome, TIsNone> = TVariant extends 'SOME'
  ? TIsSome
  : TVariant extends 'NONE'
    ? TIsNone
    : never;

type Value<TValue, TVariant extends Variant> = TVariant extends 'SOME' ? TValue : never;

// TODO docs
/** A data structure that represents either the presence or the absence of a value */
export type OptionConstructor<TValue, TVariant extends Variant> = {
  // Querying

  isSome: EvaluateVariant<TVariant, true, false>;
  isNone: EvaluateVariant<TVariant, false, true>;
  isSomeAnd: <TPredicate extends MaybePromise<boolean>>(
    fn: (value: Value<TValue, TVariant>) => TPredicate,
  ) => EvaluateVariant<TVariant, TPredicate, false>;
  inspect: (fn: (value: Value<TValue, TVariant>) => void) => OptionConstructor<TValue, TVariant>;

  // Extracting the contained value

  expect: (message: string) => Value<TValue, TVariant>;
  unwrap: () => Value<TValue, TVariant>;
  unwrapOr: <TDefaultValue>(
    defaultValue: TDefaultValue,
  ) => EvaluateVariant<TVariant, TValue, TDefaultValue>;
  unwrapOrElse: <TDefaultValue>(
    fn: () => TDefaultValue,
  ) => EvaluateVariant<TVariant, TValue, TDefaultValue>;

  // Transforming the contained value

  okOr: <TError>(error: TError) => EvaluateVariant<TVariant, Ok<TValue>, Err<TError>>;
  okOrElse: <TError>(errorFn: () => TError) => EvaluateVariant<TVariant, Ok<TValue>, Err<TError>>;
  // TODO
  // transpose: ;
  // flatten: ;
  // TODO allow promises => AsyncOption
  map: <TMappedValue>(
    fn: (value: Value<TValue, TVariant>) => TMappedValue,
  ) => EvaluateVariant<TVariant, Some<TMappedValue>, None>;
  mapOr: <TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    fn: (value: Value<TValue, TVariant>) => TMappedValue,
  ) => EvaluateVariant<TVariant, TMappedValue, TDefaultValue>;
  mapOrElse: <TDefaultValue, TMappedValue>(
    defaultFn: () => TDefaultValue,
    fn: (value: Value<TValue, TVariant>) => TMappedValue,
  ) => EvaluateVariant<TVariant, TMappedValue, TDefaultValue>;
  filter: <TPredicate extends boolean>(
    predicate: (value: Value<TValue, TVariant>) => TPredicate,
  ) => EvaluateVariant<TVariant, TPredicate extends true ? Some<TValue> : None, None>;
  // TODO `O extends AnyOption`? These can all be more typesafe
  // zip: <U>(other: Option<U>) => Option<[T, U]>;
  // zipWith: <U, R>(other: Option<U>, fn: (optA: T, optB: U) => R) => Option<R>;
  // unzip: ;

  // Boolean operators

  and: <TOptionB extends AnyOption>(opt: TOptionB) => EvaluateVariant<TVariant, TOptionB, None>;
  or: <TOptionB extends AnyOption>(
    opt: TOptionB,
  ) => EvaluateVariant<TVariant, Some<TValue>, TOptionB>;
  xor: <TOptionB extends AnyOption>(
    opt: TOptionB,
  ) => EvaluateVariant<
    TVariant,
    Ternary<TOptionB['isSome'], None, Some<TValue>>,
    Ternary<TOptionB['isSome'], TOptionB, None>
  >;
  andThen: <TOptionB extends AnyOption>(
    fn: (value: TValue) => TOptionB,
  ) => EvaluateVariant<TVariant, TOptionB, None>;
  orElse: <TOptionB extends AnyOption>(
    fn: () => TOptionB,
  ) => EvaluateVariant<TVariant, Some<TValue>, TOptionB>;

  // Rust syntax utilities

  match: <TOutput>(m: OptionMatch<Value<TValue, TVariant>, TOutput>) => TOutput;
};
