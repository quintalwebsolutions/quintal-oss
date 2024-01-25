import { NoneOption, SomeOption, isAnyOption, none, some } from './option';
import { Ternary } from './util';

function isAnyResult<T>(res: T | AnyResult): res is AnyResult {
  return (
    typeof res === 'object' &&
    res !== null &&
    'isOk' in res &&
    'isErr' in res &&
    (res.isOk === true || res.isErr === true)
  );
}

/** A type that represents either success or failure */
export type ResultConstructor<TIsOk extends boolean, T, E> = {
  // Querying the contained value

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
  isOk: TIsOk;
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
  isErr: Ternary<TIsOk, false, true>;
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
   * ok('value').inspect((value) => console.log(value)); // logs 'value' to the console
   * err('error').inspect((value) => console.log(value)); // Doesn't log anything
   */
  inspect: (fn: (value: T) => void) => ResultConstructor<TIsOk, T, E>;
  /**
   * Calls the provided closure with a reference to the contained error (if `err`).
   *
   * @example
   * ok(42).inspectErr((value) => console.log(value)); // Doesn't log anything
   * err('error').inspectErr((value) => console.log(value)); // Logs 'error' to the console
   */
  inspectErr: (fn: (error: E) => void) => ResultConstructor<TIsOk, T, E>;

  // Extracting the contained value

  /**
   * Returns the contained `ok` value, or throws the given error message it is an `err`.
   *
   * It is recommended that expect messages are used to describe the reason you expect the `Result` should be `ok` (hint: use the word 'should').
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * ok('value').expect('Value should be ok'); // 'value'
   * err('error').expect('Value should be ok'); // Throws 'Value should be ok'
   */
  expect: (message: string) => T;
  /**
   * Returns the contained `err` value, or throws the given error message it is an `ok`.
   *
   * It is recommended that expect messages are used to describe the reason you expect the `Result` should be `err` (hint: use the word 'should').
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * ok('value').expectErr('Value should be err'); // Throws 'Value should be err'
   * err('error').expectErr('Value should be err'); // 'error'
   */
  expectErr: (message: string) => E;
  /**
   * Returns the contained `ok` value, or throws the value if it is an `err`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * ok('value').unwrap(); // 'value'
   * err('error').unwrap(); // Throws 'error'
   */
  unwrap: () => T;
  /**
   * Returns the contained `err` value, or throws the value if it is is an `ok`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * ok('value').unwrapErr(); // Throws 'value'
   * err('error').unwrapErr(); // 'error'
   */
  unwrapErr: () => E;
  /**
   * Returns the contained `ok` value, or a provided default.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `unwrapOrElse`, which is lazily evaluated.
   *
   * @example
   * ok('value').unwrapOr('default'); // 'value'
   * err('error').unwrapOr('default'); // 'default'
   */
  unwrapOr: <U>(defaultValue: U) => Ternary<TIsOk, T, U>;
  /**
   * Returns the contained `ok` value, or computes it from a closure.
   *
   * @example
   * ok('value').unwrapOrElse((_error) => 'default'); // 'value'
   * err('error').unwrapOrElse((_error) => 'default'); // 'default'
   */
  unwrapOrElse: <U>(fn: (error: E) => U) => Ternary<TIsOk, T, U>;

  // Transforming the contained value

  /**
   * Converts from `Result<T, E>` to `Option<T>`, discarding the error, if any.
   *
   * @example
   * ok('value').ok(); // some('value')
   * err('error').ok(); // none
   */
  ok: () => Ternary<TIsOk, SomeOption<T>, NoneOption>;
  /**
   * Converts from `Result<T, E>` to `Option<E>`, discarding the success value, if any.
   *
   * @example
   * ok('value').err(); // none
   * err('error').err(); // some('error')
   */
  err: () => Ternary<TIsOk, NoneOption, SomeOption<E>>;
  /**
   * Transposes a `Result` of an `Option` into an `Option` of a `Result`
   *
   * @example
   * ok(none).transpose(); // none
   * ok(some('value')).transpose(); // some(ok('value'))
   * ok('value').transpose(); // some(ok('value'))
   * err(none).transpose(); // some(err(none))
   * err(some('value')).transpose(); // some(err(some('value')))
   * err('error').transpose(); // some(err('error'))
   */
  transpose: () => Ternary<
    TIsOk,
    T extends NoneOption ? T : SomeOption<OkResult<T extends SomeOption<infer TSome> ? TSome : T>>,
    SomeOption<ErrResult<E>>
  >;
  /**
   * Flattens at most one level of `Result` nesting.
   *
   * @example
   * ok('value').flatten(); // ok('value')
   * err('error').flatten(); // err('error')
   * ok(ok('value')).flatten(); // ok('value')
   * ok(err('error')).flatten(); // err('error')
   * err(ok('value')).flatten(); // err(ok('value'))
   * err(err('error)).flatten(); // err(err('error'))
   * ok(ok(ok('value'))).flatten(); // ok(ok('value'))
   */
  flatten: () => Ternary<TIsOk, T extends AnyResult ? T : OkResult<T>, ErrResult<E>>;
  /**
   * Maps a `Result<T, E>` to a `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   *
   * @example
   * ok(2).map((v) => v * 2).unwrap(); // 4
   * err(2).map((v) => v * 2).unwrapErr(); // 2
   */
  map: <U>(fn: (value: T) => U) => Ternary<TIsOk, OkResult<U>, ErrResult<E>>;
  /**
   * Maps a `Result<T, E>` to a `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   *
   * @example
   * ok(2).mapErr((v) => v * 2).unwrap(); // 2
   * err(2).mapErr((v) => v * 2).unwrapErr(); // 4
   */
  mapErr: <F>(fn: (error: E) => F) => Ternary<TIsOk, OkResult<T>, ErrResult<F>>;
  /**
   * Returns the provided default (if `err`), or applies a function to the contained value (if `ok`).
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `mapOrElse`, which is lazily evaluated.
   *
   * @example
   * ok(2).mapOr(42, (v) => v * 2).unwrap(); // 4
   * err(2).mapOr(42, (v) => v * 2).unwrapErr() // 42
   */
  mapOr: <U>(defaultValue: U, fn: (value: T) => U) => U;
  /**
   * Maps a `Result<T, E>` to `U` by applying fallback function `defaultFn` to an `err` value, or function `fn` to an `ok` value.
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * @example
   * ok(2).mapOrElse((_error) => 42, (v) => v * 2).unwrap(); // 4
   * err(2).mapOrElse((_error) => 42, (v) => v * 2).unwrapErr() // 42
   */
  mapOrElse: <U>(defaultFn: (error: E) => U, fn: (value: T) => U) => U;

  // Boolean operators

  /**
   * Returns `res` if the result is `ok`, otherwise returns its own `err` value.
   *
   * * If you are passing the result of a function call to `res`, it is recommended to use `andThen`, which is lazily evaluated.
   *
   * @example
   * err('early error').and(ok('late value')).unwrapErr(); // 'early error'
   * err('early error').and(err('late error)).unwrapErr(); // 'early error'
   * ok('early value').and(err('late error')).unwrapErr(); // 'late error'
   * ok('early value').and(ok('late value')).unwrap(); // 'late value'
   */
  and: <R extends AnyResult>(res: R) => Ternary<TIsOk, R, ErrResult<E>>;
  /**
   * Returns `res` if the result is `err`, otherwise returns its own `ok` value.
   *
   * * If you are passing the result of a function call to `res`, it is recommended to use `orElse`, which is lazily evaluated.
   *
   * @example
   * ok('early value').or(ok('late value)).unwrap(); // 'early value'
   * ok('early value').or(err('late error')).unwrap(); // 'early value'
   * err('early error').or(ok('late value')).unwrap(); // 'late value'
   * err('early error').or(err('late error)).unwrapErr(); // 'late error'
   */
  or: <R extends AnyResult>(res: R) => Ternary<TIsOk, OkResult<T>, R>;
  /**
   * Calls `fn` if the result is `ok`, otherwise return its own `err` value.
   *
   * This function can be used for control flow based on Result values.
   *
   * @example
   * const s = (x: number) => x === 42 ? err('bad number') : ok(x * x);
   * ok(2).andThen(s).unwrap(); // 4
   * ok(42).andThen(s).unwrapErr(); // 'bad number'
   * err('not a number').andThen(s).unwrapErr(); // 'not a number'
   */
  andThen: <R extends AnyResult>(fn: (value: T) => R) => Ternary<TIsOk, R, ErrResult<E>>;
  /**
   * Calls `fn` if the result is `err`, otherwise returns its own `ok` value.
   *
   * This function can be used for control flow based on result values.
   *
   * @example
   * const s = (x: number) => ok(x * x);
   * const e = (x: number) => err(x);
   * ok(2).orElse(s).orElse(s).unwrap(); // 2
   * ok(2).orElse(e).orElse(s).unwrap(); // 2
   * err(2).orElse(s).orElse(e).unwrap(); // 4
   * err(3).orElse(e).orElse(e).unwrapErr(); // 3
   */
  orElse: <R extends AnyResult>(fn: (error: E) => R) => Ternary<TIsOk, OkResult<T>, R>;
};

export type OkResult<T> = ResultConstructor<true, T, never>;
export type ErrResult<E> = ResultConstructor<false, never, E>;
export type Result<T, E> = OkResult<T> | ErrResult<E>;
export type AsyncResult<T, E> = Promise<Result<T, E>>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyResult = Result<any, any>;

export function ok<T>(value: T): OkResult<T> {
  return {
    isOk: true,
    isErr: false,
    isOkAnd: (fn) => fn(value),
    isErrAnd: () => false,
    inspect: (fn) => {
      fn(value);
      return ok(value);
    },
    inspectErr: () => ok(value),
    expect: () => value,
    expectErr: (message) => {
      throw new Error(message);
    },
    unwrap: () => value,
    unwrapErr: () => {
      throw new Error(`Attempted to unwrapErr an 'ok' value: ${value}`);
    },
    unwrapOr: () => value,
    unwrapOrElse: () => value,
    ok: () => some(value),
    err: () => none,
    transpose: () => {
      // TODO achieve without casts
      type Cast = T extends NoneOption
        ? T
        : SomeOption<OkResult<T extends SomeOption<infer TSome> ? TSome : T>>;
      const isOption = isAnyOption(value);
      if (isOption && value.isNone) return value as Cast;
      return some(ok(isOption && value.isSome ? value.unwrap() : value)) as Cast;
    },
    flatten: () => {
      // TODO achieve without cast
      type Cast = T extends AnyResult ? T : OkResult<T>;
      if (isAnyResult(value)) return value as Cast;
      return ok(value) as Cast;
    },
    map: (fn) => ok(fn(value)),
    mapErr: () => ok(value),
    mapOr: (_, fn) => fn(value),
    mapOrElse: (_, fn) => fn(value),
    and: (res) => res,
    or: () => ok(value),
    andThen: (fn) => fn(value),
    orElse: () => ok(value),
  };
}

export function err<E>(error: E): ErrResult<E> {
  return {
    isOk: false,
    isErr: true,
    isOkAnd: () => false,
    isErrAnd: (fn) => fn(error),
    inspect: () => err(error),
    inspectErr: (fn) => {
      fn(error);
      return err(error);
    },
    expect: (message) => {
      throw new Error(message);
    },
    expectErr: () => error,
    unwrap: () => {
      throw new Error(`Attempted to unwrap an 'err' value: ${error}`);
    },
    unwrapErr: () => error,
    unwrapOr: (defaultValue) => defaultValue,
    unwrapOrElse: (fn) => fn(error),
    ok: () => none,
    err: () => some(error),
    transpose: () => some(err(error)),
    flatten: () => err(error),
    map: () => err(error),
    mapErr: (fn) => err(fn(error)),
    mapOr: (defaultValue) => defaultValue,
    mapOrElse: (defaultFn) => defaultFn(error),
    and: () => err(error),
    or: (res) => res,
    andThen: () => err(error),
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

export async function asyncResult<T>(fn: () => Promise<T>): AsyncResult<Awaited<T>, unknown> {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}
