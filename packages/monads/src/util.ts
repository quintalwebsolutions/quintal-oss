/* c8 ignore start */
// TODO remove ignore comment when this issue is resolved: https://github.com/vitest-dev/vitest/issues/3605

export type Ternary<Condition extends boolean, True, False> = Condition extends true ? True : False;

export type MaybePromise<T> = T | Promise<T>;
