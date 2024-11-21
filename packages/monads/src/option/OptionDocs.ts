import type { OptionTernary, ValueFromSome } from './types';

type OptionVariant = 'some' | 'none' | 'async';

type EvaluateOptionVariant<
  TVariant extends OptionVariant,
  TMap extends Record<OptionVariant, unknown>,
> = TMap[TVariant];

// type OptionValue<TValue, TVariant extends Variant> = EvaluateVariant<
//   TVariant,
//   { some: TValue; none: never; async: ValueFromSome<TValue> }
// >;

/** A data structure that represents either the presence or the absence of a value */
export type OptionDocs<TValue, TVariant extends OptionVariant> = {
  // TODO regions
  // TODO docs
  isSome: EvaluateOptionVariant<
    TVariant,
    { some: true; none: false; async: Promise<OptionTernary<TValue, true, false>> }
  >;
  isNone: EvaluateOptionVariant<
    TVariant,
    { some: false; none: true; async: Promise<OptionTernary<TValue, false, true>> }
  >;
  unwrap: () => EvaluateOptionVariant<
    OptionVariant,
    { some: TValue; none: never; async: Promise<ValueFromSome<TValue>> }
  >;

  // TODO rest of the methods
  // isSomeAnd: <TPredicate extends MaybePromise<boolean>>(
  //   fn: (value: Value<TValue, TVariant>) => TPredicate,
  // ) => EvaluateVariant<TVariant, TPredicate, false>;
  // inspect: (fn: (value: Value<TValue, TVariant>) => void) => OptionConstructor<TValue, TVariant>;
  // expect: (message: string) => Value<TValue, TVariant>;
  // unwrap: () => Value<TValue, TVariant>;
  // unwrapOr: <TDefaultValue>(
  //   defaultValue: TDefaultValue,
  // ) => EvaluateVariant<TVariant, TValue, TDefaultValue>;
  // unwrapOrElse: <TDefaultValue>(
  //   fn: () => TDefaultValue,
  // ) => EvaluateVariant<TVariant, TValue, TDefaultValue>;
  // okOr: <TError>(error: TError) => EvaluateVariant<TVariant, Ok<TValue>, Err<TError>>;
  // okOrElse: <TError>(errorFn: () => TError) => EvaluateVariant<TVariant, Ok<TValue>, Err<TError>>;
  // // transpose: ;
  // // flatten: ;
  // map: <TMappedValue>(
  //   fn: (value: Value<TValue, TVariant>) => TMappedValue,
  // ) => EvaluateVariant<TVariant, Some<TMappedValue>, None>;
  // mapOr: <TDefaultValue, TMappedValue>(
  //   defaultValue: TDefaultValue,
  //   fn: (value: Value<TValue, TVariant>) => TMappedValue,
  // ) => EvaluateVariant<TVariant, TMappedValue, TDefaultValue>;
  // mapOrElse: <TDefaultValue, TMappedValue>(
  //   defaultFn: () => TDefaultValue,
  //   fn: (value: Value<TValue, TVariant>) => TMappedValue,
  // ) => EvaluateVariant<TVariant, TMappedValue, TDefaultValue>;
  // filter: <TPredicate extends boolean>(
  //   predicate: (value: Value<TValue, TVariant>) => TPredicate,
  // ) => EvaluateVariant<TVariant, TPredicate extends true ? Some<TValue> : None, None>;
  // // `O extends AnyOption`? These can all be more typesafe
  // // zip: <U>(other: Option<U>) => Option<[T, U]>;
  // // zipWith: <U, R>(other: Option<U>, fn: (optA: T, optB: U) => R) => Option<R>;
  // // unzip: ;
  // and: <TOptionB extends AnyOption>(opt: TOptionB) => EvaluateVariant<TVariant, TOptionB, None>;
  // or: <TOptionB extends AnyOption>(
  //   opt: TOptionB,
  // ) => EvaluateVariant<TVariant, Some<TValue>, TOptionB>;
  // xor: <TOptionB extends AnyOption>(
  //   opt: TOptionB,
  // ) => EvaluateVariant<
  //   TVariant,
  //   Ternary<TOptionB['isSome'], None, Some<TValue>>,
  //   Ternary<TOptionB['isSome'], TOptionB, None>
  // >;
  // andThen: <TOptionB extends AnyOption>(
  //   fn: (value: TValue) => TOptionB,
  // ) => EvaluateVariant<TVariant, TOptionB, None>;
  // orElse: <TOptionB extends AnyOption>(
  //   fn: () => TOptionB,
  // ) => EvaluateVariant<TVariant, Some<TValue>, TOptionB>;
  // match: <TOutput>(m: OptionMatch<Value<TValue, TVariant>, TOutput>) => TOutput;
};
