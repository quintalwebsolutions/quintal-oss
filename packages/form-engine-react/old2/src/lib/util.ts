/** Value that may be a promise, or not */
export type MaybePromise<T> = T | Promise<T>;

/** Function return value that may be void, or not */
// eslint-disable-next-line @typescript-eslint/no-invalid-void-type -- we allow it for function return types
export type MaybeVoid<T> = T | void;

/** Function return value that may be a promise of may be a void, or not, or not */
export type MaybePromiseVoid<T> = MaybePromise<MaybeVoid<T>>;
