type IsOk<TOk extends boolean, TTrue, TFalse> = TOk extends true
  ? TTrue
  : TOk extends false
    ? TFalse
    : never;

/** A type that represents either success or failure */
type ResultConstructor<TOk extends boolean, T, E> = {
  /** Is `true` if the result is `ok` */
  isOk: TOk;
  /** Is `true` if the result is `err` */
  isErr: IsOk<TOk, false, true>;
  /**
   * Maps a `Result<T, E>` to `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
   */
  map: <U>(fn: (val: T) => U) => IsOk<TOk, OkResult<U>, ErrResult<E>>;
  /**
   * Returns the contained `ok` value, or throws the value if it is an `err`.
   * * Because this function may throw, it is generally discouraged. Instead, prefer to use `unwrapOr`.
   */
  unwrap: () => T;
};

export type OkResult<T> = ResultConstructor<true, T, never>;
export type ErrResult<E> = ResultConstructor<false, never, E>;
export type Result<T, E> = OkResult<T> | ErrResult<E>;

export function ok<T>(value: T): OkResult<T> {
  return {
    isOk: true,
    isErr: false,
    map: (fn) => ok(fn(value)),
    unwrap: () => value,
  };
}

export function err<E>(error: E): ErrResult<E> {
  return {
    isOk: false,
    isErr: true,
    map: () => err(error),
    unwrap: () => {
      throw error;
    },
  };
}

export function result<T>(fn: () => T): Result<T, unknown> {
  try {
    const value = fn();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}
