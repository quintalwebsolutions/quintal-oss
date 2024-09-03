/* c8 ignore start */

export type Ternary<TCondition extends boolean, TTrue, TFalse> = TCondition extends true
  ? TTrue
  : TFalse;

export type MaybePromise<TValue> = TValue | Promise<TValue>;
