/* c8 ignore start */
// TODO remove ignore comment when this issue is resolved: https://github.com/vitest-dev/vitest/issues/3605

export type Ternary<TCondition extends boolean, TTrue, TFalse> = TCondition extends true
  ? TTrue
  : TFalse;

// Source https://www.totaltypescript.com/how-to-test-your-types
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;

export type And<X extends boolean, Y extends boolean> = Ternary<X, Y, false>;

export type Or<X extends boolean, Y extends boolean> = Ternary<X, true, Y>;

export type MaybePromise<T> = T | Promise<T>;
