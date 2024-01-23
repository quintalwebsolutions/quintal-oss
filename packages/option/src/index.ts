type IsSome<TSome extends boolean, TTrue, TFalse> = TSome extends true ? TTrue : TFalse;

/** A type that represents either success or failure */
export type OptionConstructor<TSome extends boolean, T> = {
  isSome: TSome;
  isSomeAnd: (value: T) => boolean;
  isNone: IsSome<TSome, false, true>;
  expect: (message: string) => T;
  unwrap: () => T;
  unwrapOr: <U>(defaultValue: U) => IsSome<TSome, T, U>;
  unwrapOrElse: <U>(fn: () => U) => IsSome<TSome, T, U>;
  and: <U>(optb: Option<U>) => Option<U>;
  andThen: <U>(fn: Option<U>) => Option<U>;
  filter: (predicate: (value: T) => boolean) => Option<T>;
  flatten: () => Option<T>;
  getOrInsert: (value: T) => Option<T>;
  getOrInsertWith: (fn: () => T) => Option<T>;
  insert: (value: T) => Option<T>;
  inspect: (fn: (value: T) => void) => Option<T>;

};

export type SomeOption<T> = OptionConstructor<true, T>;
export type NoneOption = OptionConstructor<false, never>;
export type Option<T> = SomeOption<T> | NoneOption;

// biome-ignore lint/suspicious/noExplicitAny: This type exists for generics parameters to extend
export type AnyOption = Option<any>;

export function some<T>(value: T): SomeOption<T> {
  return {
    isSome: true,
    isNone: false,
    expect: () => value,
    unwrap: () => value,
  }
}

export const none: NoneOption = {
  isSome: false,
  isNone: true,
  expect: (message) => {
    throw message;
  },
  unwrap: () => {
    throw new ReferenceError('Attempted to unwrap a none value');
  }
}
