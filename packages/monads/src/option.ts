import { Err, Ok, err, ok } from './result';
import { Ternary } from './util';

export function isAnyOption<T>(opt: T | AnyOption): opt is AnyOption {
  return (
    typeof opt === 'object' &&
    opt !== null &&
    'isSome' in opt &&
    'isNone' in opt &&
    (opt.isSome === true || opt.isNone === true)
  );
}

// TODO add docs and tests

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
  ) => Ternary<TIsSome, Ternary<O['isSome'], None, Some<T>>, Ternary<O['isSome'], O, None>>;
  andThen: <O extends AnyOption>(fn: (value: T) => O) => Ternary<TIsSome, O, None>;
  orElse: <O extends AnyOption>(fn: () => O) => Ternary<TIsSome, Some<T>, O>;
};

export type Some<T> = OptionConstructor<true, T>;
export type None = OptionConstructor<false, never>;
export type Option<T> = Some<T> | None;

// biome-ignore lint/suspicious/noExplicitAny: This type exists for generics parameters to extend
export type AnyOption = Option<any>;

export function some<T>(value: T): Some<T> {
  return {
    isSome: true,
    isNone: false,
    TernaryAnd: (fn) => fn(value),
    inspect: (fn) => {
      fn(value);
      return some(value);
    },
    expect: () => value,
    unwrap: () => value,
    unwrapOr: () => value,
    unwrapOrElse: () => value,
    okOr: () => ok(value),
    okOrElse: () => ok(value),
    map: (fn) => some(fn(value)),
    mapOr: (_, fn) => fn(value),
    mapOrElse: (_, fn) => fn(value),
    filter: (p) => {
      // TODO achieve without cast
      type Cast = ReturnType<typeof p> extends true ? Some<T> : None;
      return (p(value) ? some(value) : none) as Cast;
    },
    and: (opt) => opt,
    or: () => some(value),
    xor: (opt) => {
      // TODO achieve without cast
      type Cast = Ternary<(typeof opt)['isSome'], None, Some<T>>;
      return (opt.isSome ? none : some(value)) as Cast;
    },
    andThen: (fn) => fn(value),
    orElse: () => some(value),
  };
}

export const none: None = {
  isSome: false,
  isNone: true,
  TernaryAnd: () => false,
  inspect: () => none,
  expect: (message) => {
    throw message;
  },
  unwrap: () => {
    throw new ReferenceError('Attempted to unwrap a none value');
  },
  unwrapOr: (defaultValue) => defaultValue,
  unwrapOrElse: (fn) => fn(),
  okOr: (error) => err(error),
  okOrElse: (error) => err(error()),
  map: () => none,
  mapOr: (defaultValue) => defaultValue,
  mapOrElse: (defaultFn) => defaultFn(),
  filter: () => none,
  and: () => none,
  or: (opt) => opt,
  xor: (opt) => {
    // TODO achieve without cast
    type Cast = Ternary<(typeof opt)['isSome'], typeof opt, None>;
    return (opt.isSome ? opt : none) as Cast;
  },
  andThen: () => none,
  orElse: (fn) => fn(),
};
