type IsOk<TOk extends boolean, TTrue, TFalse> = TOk extends true
  ? TTrue
  : TOk extends false
    ? TFalse
    : never;

/** A type that represents either success or failure */
export type ResultConstructor<TOk extends boolean, T, E> = {
  /**
   * TODO implement these functions
   * - ok: Converts from `Result<T, E>` to `Option<T>`, discarding the error, if any.
   * - err: Converts from `Result<T, E>` to `Option<E>`, discarding the success value, if any.
   * - expect: Returns the contained `ok` value
   * - expectErr: Returns the contained `err` value
   * - isOkAnd: Returns `true` if the result is `ok` and the value inside of it matches a predicate.
   * - isErrAnd: Returns `true` if the result is `err` and the value inside of it matches a predicate.
   * - flatten & transpose?
   */

  /**
   * Is `true` if the result is `ok`.
   *
   * This property can be used to type-narrow the result value.
   *
   * @example
   * // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `unknown`
   * const r = result(() => true);
   *
   * if (r.isOk) {
   *   // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `never`
   * } else {
   *   // `r.unwrap()` is of type `never`, `r.unwrapErr()` is of type `unknown`
   * }
   */
  isOk: TOk;
  /**
   * Is `true` if the result is `err`.
   *
   * This property can be used to type-narrow the result value.
   *
   * @example
   * // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `unknown`
   * const r = result(() => true);
   *
   * if (r.isErr) {
   *   // `r.unwrap()` is of type `never`, `r.unwrapErr()` is of type `unknown`
   * } else {
   *   // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `never`
   * }
   */
  isErr: IsOk<TOk, false, true>;

  /**
   * Calls the provided closure with a reference to the contained value (if `ok`).
   *
   * @example
   * ok(42).inspect((value) => console.log(value)); // logs "42" to the console
   * err('error').inspect((value) => console.log(value)); // Doesn't log anything
   */
  inspect: (fn: (value: T) => void) => ResultConstructor<TOk, T, E>;
  /**
   * Calls the provided closure with a reference to the contained error (if `err`).
   *
   * @example
   * ok(42).inspectErr((value) => console.log(value)); // Doesn't log anything
   * err('error').inspectErr((value) => console.log(value)); // Logs "error" to the console
   */
  inspectErr: (fn: (error: E) => void) => ResultConstructor<TOk, T, E>;

  /**
   * Returns `res` if the result is `ok`, otherwise returns its own `err` value.
   *
   * * If you are passing the result of a function call to `res`, it is recommended to use `andThen`, which is lazily evaluated.
   *
   * @example
   * const x = ok(2);
   * const y = err('late error');
   * expect(x.and(y)).toBe(err('late error'));
   *
   * @example
   * const x = err('early error');
   * const y = ok('foo');
   * expect(x.and(y)).toBe(err('early error'));
   *
   * @example
   * const x = err('not a 2');
   * const y = err('late error');
   * expect(x.and(y)).toBe(err('not a 2'));
   *
   * @example
   * const x = ok(2);
   * const y = ok('different result type');
   * expect(x.and(y)).toBe(ok('different result type'));
   */
  and: <R extends AnyResult>(res: R) => IsOk<TOk, R, ResultConstructor<TOk, T, E>>;
  /**
   * Calls `fn` if the result is `ok`, otherwise return its own `err` value.
   *
   * This function can be used for control flow based on Result values.
   *
   * @example
   * const s = (x: number) => x === 42 ? err('bad number') : ok(x * x);
   * expect(ok(2)).andThen(s)).toBe(ok(4));
   * expect(ok(42).andThen(s)).toBe(err('bad number'));
   * expect(err('not a number').andThen(s)).toBe(err('not a number'));
   */
  andThen: <U>(fn: (value: T) => Result<U, E>) => Result<U, E>;
  /**
   * Returns `res` if the result is `err`, otherwise returns its own `ok` value.
   *
   * * If you are passing the result of a function call to `res`, it is recommended to use `orElse`, which is lazily evaluated.
   *
   * @example
   * const x = ok(2);
   * const y = err('late error');
   * expect(x.or(y)).toBe(ok(2));
   *
   * @example
   * const x = err('early error');
   * const y = ok(2);
   * expect(x.or(y)).toBe(ok(2));
   *
   * @example
   * const x = err('not a 2');
   * const y = err('late error');
   * expect(x.or(y)).toBe(err('late error'));
   *
   * @example
   * const x = ok(2);
   * const y = ok(100);
   * expect(x.or(y)).toBe(ok(2));
   */
  or: <R extends AnyResult>(res: R) => IsOk<TOk, ResultConstructor<TOk, T, E>, R>;
  /**
   * Calls `fn` if the result is `err`, otherwise returns its own `ok` value.
   *
   * This function can be used for control flow based on result values.
   *
   * @example
   * const s = (x: number) => ok(x * x);
   * const e = (x: number) => err(x);
   * expect(ok(2).orElse(s).orElse(s)).toBe(ok(2));
   * expect(ok(2).orElse(e).orElse(s)).toBe(ok(2));
   * expect(err(3).orElse(s).orElse(e)).toBe(ok(9));
   * expect(err(3).orElse(e).orElse(e)).toBe(err(3));
   */
  orElse: <F>(fn: (error: E) => Result<T, F>) => Result<T, F>;

  /**
   * Maps a `Result<T, E>` to a `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   */
  map: <U>(fn: (value: T) => U) => IsOk<TOk, OkResult<U>, ErrResult<E>>;
  /**
   * Maps a `Result<T, E>` to a `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   */
  mapErr: <F>(fn: (error: E) => F) => IsOk<TOk, OkResult<T>, ErrResult<F>>;
  /**
   * Returns the provided default (if `err`), or applies a function to the contained value (if `ok`).
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `mapOrElse`, which is lazily evaluated.
   */
  mapOr: <U>(defaultValue: U, fn: (value: T) => U) => U;
  /**
   * Maps a `Result<T, E>` to `U` by applying fallback function `defaultFn` to an `err` value, or function `fn` to an `ok` value.
   *
   * This function can be used to unpack a successful result while handling an error.
   */
  mapOrElse: <U>(defaultFn: (error: E) => U, fn: (value: T) => U) => U;

  /**
   * Returns the contained `ok` value, or throws the value if it is an `err`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   */
  unwrap: () => T;
  /**
   * Returns the contained `err` value, or throws the value if it is is an `ok`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   */
  unwrapErr: () => E;
  /**
   * Returns the contained `ok` value, or a provided default.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `unwrapOrElse`, which is lazily evaluated.
   */
  unwrapOr: (defaultValue: T) => T;
  /**
   * Returns the contained `ok` value, or computes it from a closure.
   */
  unwrapOrElse: (op: (error: E) => T) => T;
};

export type OkResult<T> = ResultConstructor<true, T, never>;
export type ErrResult<E> = ResultConstructor<false, never, E>;
export type Result<T, E> = OkResult<T> | ErrResult<E>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists for generics parameters to extend
export type AnyResult = Result<any, any>;

export function ok<T>(value: T): OkResult<T> {
  return {
    isOk: true,
    isErr: false,
    inspect: (fn) => {
      fn(value);
      return ok(value);
    },
    inspectErr: () => ok(value),
    and: (res) => res,
    andThen: (fn) => fn(value), // TODO test
    or: () => ok(value),
    orElse: () => ok(value), // TODO test
    map: (fn) => ok(fn(value)),
    mapErr: () => ok(value), // TODO test
    mapOr: (_, fn) => fn(value), // TODO test
    mapOrElse: (_, fn) => fn(value), // TODO test
    unwrap: () => value,
    unwrapErr: () => {
      throw value;
    },
    unwrapOr: () => value, // TODO test
    unwrapOrElse: () => value, // TODO test
  };
}

export function err<E>(error: E): ErrResult<E> {
  return {
    isOk: false,
    isErr: true,
    inspect: () => err(error),
    inspectErr: (fn) => {
      fn(error);
      return err(error);
    },
    and: () => err(error),
    andThen: () => err(error), // TODO test
    or: (res) => res,
    orElse: (fn) => fn(error), // TODO test
    map: () => err(error),
    mapErr: (fn) => err(fn(error)), // TODO test
    mapOr: (defaultValue) => defaultValue, // TODO test
    mapOrElse: (defaultFn) => defaultFn(error), // TODO test
    unwrap: () => {
      throw error;
    },
    unwrapErr: () => error,
    unwrapOr: (defaultValue) => defaultValue, // TODO test
    unwrapOrElse: (fn) => fn(error), // TODO test
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

export async function asyncResult<T>(fn: () => Promise<T>): Promise<Result<T, unknown>> {
  try {
    const value = (await fn()) as T; // I don't get why this cast is necessary
    return ok(value);
  } catch (e) {
    return err(e);
  }
}
