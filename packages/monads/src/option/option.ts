import { err, ok } from '../result';
import { Ternary } from '../util';
import { OptionConstructor } from './option-constructor';

// TODO add docs and tests

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
