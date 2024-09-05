export type Ternary<TCondition extends boolean, TTrue, TFalse> = TCondition extends true
  ? TTrue
  : TFalse;

export type MaybePromise<TValue> = TValue | Promise<TValue>;

export type InferredValue = string | number | boolean;
