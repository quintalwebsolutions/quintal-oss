type IsOk<TOk extends boolean, TTrue, TFalse> = TOk extends true ? TTrue : TFalse;

/** A type that represents either success or failure */
export type ResultConstructor<TOk extends boolean, T, E> = {
  // Querying contained values

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
  isOk: TOk; // TODO should this be a function? It would be more true to Rust
  /**
   * Returns `true` if the result is `ok` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isOkAnd(() => true); // true
   * ok('value').isOkAnd(() => false); // false
   * err('error').isOkAnd(() => true); // false
   * err('error').isOkAnd(() => false); // false
   */
  isOkAnd: (fn: (value: T) => boolean) => boolean;
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
  isErr: IsOk<TOk, false, true>; // TODO should this be a function? It would be more true to Rust
  /**
   * Returns `true` if the result is `err` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isErrAnd(() => true); // false
   * ok('value').isErrAnd(() => false); // false
   * err('error').isErrAnd(() => true); // true
   * err('error').isErrAnd(() => false); // false
   */
  isErrAnd: (fn: (error: E) => boolean) => boolean;
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

  // Extracting a contained value

  /**
   * Returns the contained `ok` value, or throws the given error message it is an `err`.
   *
   * It is recommended that expect messages are used to describe the reason you expect the `Result` should be `ok` (hint: use the word "should").
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * console.log(ok(42).expect("Value should be ok")); // Logs "42" to the console
   * console.log(err('error').expect("Value should be ok")); // Throws "Value should be ok"
   */
  expect: (message: string) => T;
  /**
   * Returns the contained `err` value, or throws the given error message it is an `ok`.
   *
   * It is recommended that expect messages are used to describe the reason you expect the `Result` should be `err` (hint: use the word "should").
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * console.log(ok(42).expectErr("Value should be err")); // Throws "Value should be err"
   * console.log(err('error').expectErr("Value should be err")); // Logs "error" to the console
   */
  expectErr: (message: string) => E;
  /**
   * Returns the contained `ok` value, or throws the value if it is an `err`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * console.log(ok(42).unwrap()); // Logs "42" to the console
   * console.log(err('error').unwrap()); // Throws "error"
   */
  unwrap: () => T;
  /**
   * Returns the contained `err` value, or throws the value if it is is an `ok`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * console.log(ok(42).unwrapErr()); // Throws "42"
   * console.log(err('error').unwrapErr()); // Logs "error" to the console
   */
  unwrapErr: () => E;
  /**
   * Returns the contained `ok` value, or a provided default.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `unwrapOrElse`, which is lazily evaluated.
   *
   * @example
   * console.log(ok('value').unwrapOr('default')); // Logs 'value' to the console
   * console.log(err('error').unwrapOr('default')); // Logs 'default' to the console
   */
  unwrapOr: <U>(defaultValue: U) => IsOk<TOk, T, U>;
  /**
   * Returns the contained `ok` value, or computes it from a closure.
   *
   * @example
   * console.log(ok('value').unwrapOrElse((error) => 'default')); // Logs 'value' to the console
   * console.log(err('error').unwrapOrElse((error) => 'default')); // Logs 'default' to the console
   */
  unwrapOrElse: <U>(op: (error: E) => U) => IsOk<TOk, T, U>;

  // Transforming contained values

  // TODO ok: Converts from `Result<T, E>` to `Option<T>`, discarding the error, if any.
  // TODO err: Converts from `Result<T, E>` to `Option<E>`, discarding the success value, if any.
  /**
   * Maps a `Result<T, E>` to a `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   *
   * @example
   * console.log(ok(2).map((v) => v * 2).unwrap()); // Logs '4' to the console
   * console.log(err(2).map((v) => v * 2).unwrapErr()); // Logs '2' to the console
   */
  map: <U>(fn: (value: T) => U) => IsOk<TOk, OkResult<U>, ErrResult<E>>;
  /**
   * Maps a `Result<T, E>` to a `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   *
   * @example
   * console.log(ok(2).mapErr((v) => v * 2).unwrap()); // Logs '2' to the console
   * console.log(err(2).mapErr((v) => v * 2).unwrapErr()); // Logs '4' to the console
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

  // Boolean operators

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
  and: <R extends AnyResult>(res: R) => IsOk<TOk, R, ErrResult<E>>;
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
  andThen: <R extends AnyResult>(fn: (value: T) => R) => IsOk<TOk, R, ErrResult<E>>;
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
  or: <R extends AnyResult>(res: R) => IsOk<TOk, OkResult<T>, R>;
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
  orElse: <R extends AnyResult>(fn: (error: E) => R) => IsOk<TOk, OkResult<T>, R>;
};

export type OkResult<T> = ResultConstructor<true, T, never>;
export type ErrResult<E> = ResultConstructor<false, never, E>;
export type Result<T, E> = OkResult<T> | ErrResult<E>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists for generics parameters to extend
export type AnyResult = Result<any, any>;

export function ok<T>(value: T): OkResult<T> {
  return {
    isOk: true,
    isOkAnd: (fn) => fn(value),
    isErr: false,
    isErrAnd: () => false,
    inspect: (fn) => {
      fn(value);
      return ok(value);
    },
    inspectErr: () => ok(value),
    expect: () => value,
    expectErr: (message) => {
      throw message;
    },
    unwrap: () => value,
    unwrapErr: () => {
      throw value;
    },
    unwrapOr: () => value,
    unwrapOrElse: () => value,
    map: (fn) => ok(fn(value)),
    mapErr: () => ok(value),
    mapOr: (_, fn) => fn(value),
    mapOrElse: (_, fn) => fn(value),
    and: (res) => res,
    andThen: (fn) => fn(value),
    or: () => ok(value),
    orElse: () => ok(value),
  };
}

export function err<E>(error: E): ErrResult<E> {
  return {
    isOk: false,
    isOkAnd: () => false,
    isErr: true,
    isErrAnd: (fn) => fn(error),
    inspect: () => err(error),
    inspectErr: (fn) => {
      fn(error);
      return err(error);
    },
    expect: (message) => {
      throw message;
    },
    expectErr: () => error,
    unwrap: () => {
      throw error;
    },
    unwrapErr: () => error,
    unwrapOr: (defaultValue) => defaultValue,
    unwrapOrElse: (fn) => fn(error),
    map: () => err(error),
    mapErr: (fn) => err(fn(error)),
    mapOr: (defaultValue) => defaultValue,
    mapOrElse: (defaultFn) => defaultFn(error),
    and: () => err(error),
    andThen: () => err(error),
    or: (res) => res,
    orElse: (fn) => fn(error),
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
