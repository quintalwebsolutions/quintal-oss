export type Ternary<TPredicate extends boolean, TTrue, TFalse> = TPredicate extends true
  ? TTrue
  : TFalse;

export type MaybePromise<TValue> = TValue | Promise<TValue>;

export type SimpleValue = string | number | boolean;
