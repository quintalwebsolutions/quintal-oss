/* c8 ignore start */

export type Ternary<Condition extends boolean, True, False> = Condition extends true ? True : False;

export type MaybePromise<T> = T | Promise<T>;
