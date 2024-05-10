/* c8 ignore start */
// TODO remove ignore comment when this issue is resolved: https://github.com/vitest-dev/vitest/issues/3605

import type { None, Some } from '../option';
import type { MaybePromise } from '../util';
import type { AsyncErr, AsyncOk } from './async-result';
import type { Err, Ok } from './result';
import type { AnyResult, ResultMatch } from './util';

// TODO ASYNC variant to share docs?
type Variant = 'OK' | 'ERR';
type Eval<V extends Variant, TIsOk, TIsErr> = V extends 'OK'
  ? TIsOk
  : V extends 'ERR'
    ? TIsErr
    : never;

type Value<T, V extends Variant> = V extends 'OK' ? T : never;
type Error<T, V extends Variant> = V extends 'ERR' ? T : never;

/** A data structure that represents either success or failure */
export type ResultConstructor<T, V extends Variant> = {
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
  isOk: Eval<V, true, false>;
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
  isErr: Eval<V, false, true>;
  /**
   * Returns `true` if the result is `ok` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isOkAnd(() => true); // true
   * ok('value').isOkAnd(() => false); // false
   * err('error').isOkAnd(() => true); // false
   * err('error').isOkAnd(() => false); // false
   */
  isOkAnd: <P extends MaybePromise<boolean>>(fn: (value: Value<T, V>) => P) => Eval<V, P, false>;
  /**
   * Returns `true` if the result is `err` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isErrAnd(() => true); // false
   * ok('value').isErrAnd(() => false); // false
   * err('error').isErrAnd(() => true); // true
   * err('error').isErrAnd(() => false); // false
   */
  isErrAnd: <P extends MaybePromise<boolean>>(fn: (error: Error<T, V>) => P) => Eval<V, false, P>;
  /**
   * Calls the provided closure with the contained value (if `ok`).
   *
   * @example
   * ok('value').inspect((value) => console.log(value)); // logs 'value' to the console
   * err('error').inspect((value) => console.log(value)); // Doesn't do anything
   */
  inspect: (fn: (value: Value<T, V>) => MaybePromise<void>) => ResultConstructor<T, V>;
  /**
   * Calls the provided closure with the contained error (if `err`).
   *
   * @example
   * ok('value').inspectErr((value) => console.log(value)); // Doesn't do anything
   * err('error').inspectErr((value) => console.log(value)); // Logs 'error' to the console
   */
  inspectErr: (fn: (error: Error<T, V>) => MaybePromise<void>) => ResultConstructor<T, V>;

  // Extracting the contained value

  /**
   * Returns the contained `ok` value, or throws a given error message it is an `err`.
   *
   * It is recommended that expect messages are used to describe the reason you expect the `Result` should be `ok` (hint: use the word 'should').
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * ok('value').expect('Value should be ok'); // 'value'
   * err('error').expect('Value should be ok'); // Throws 'Value should be ok'
   */
  expect: (message: string) => Value<T, V>;
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
  expectErr: (message: string) => Error<T, V>;
  /**
   * Returns the contained `ok` value, or throws the value if it is an `err`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * ok('value').unwrap(); // 'value'
   * err('error').unwrap(); // Throws 'error'
   */
  unwrap: () => Value<T, V>;
  /**
   * Returns the contained `err` value, or throws the value if it is is an `ok`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * ok('value').unwrapErr(); // Throws 'value'
   * err('error').unwrapErr(); // 'error'
   */
  unwrapErr: () => Error<T, V>;
  /**
   * Returns the contained `ok` value, or a provided default.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `unwrapOrElse`, which is lazily evaluated.
   *
   * @example
   * ok('value').unwrapOr('default'); // 'value'
   * err('error').unwrapOr('default'); // 'default'
   */
  unwrapOr: <U>(defaultValue: U) => Eval<V, T, U>;
  /**
   * Returns the contained `ok` value, or computes a default from a provided closure.
   *
   * @example
   * ok('value').unwrapOrElse((_error) => 'default'); // 'value'
   * err('error').unwrapOrElse((_error) => 'default'); // 'default'
   */
  unwrapOrElse: <U>(fn: (error: Error<T, V>) => U) => Eval<V, T, U>;

  // Transforming the contained value

  /**
   * Converts from `Result<T, E>` to `Option<T>`, discarding the error, if any.
   *
   * @example
   * ok('value').ok(); // some('value')
   * err('error').ok(); // none
   */
  ok: () => Eval<V, Some<T>, None>;
  /**
   * Converts from `Result<T, E>` to `Option<E>`, discarding the success value, if any.
   *
   * @example
   * ok('value').err(); // none
   * err('error').err(); // some('error')
   */
  err: () => Eval<V, None, Some<T>>;
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
  transpose: () => Eval<
    V,
    T extends None ? T : Some<Ok<T extends Some<infer TSome> ? TSome : T>>,
    Some<Err<T>>
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
   * ok(ok(ok('value'))).flatten().flatten(); // ok('value')
   */
  flatten: () => Eval<V, T extends AnyResult ? T : Ok<T>, Err<T>>;
  /**
   * Maps a `Result<T, E>` to a `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   *
   * @example
   * ok(2).map((v) => v * 2).unwrap(); // 4
   * err(2).map((v) => v * 2).unwrapErr(); // 2
   */
  map: <U>(
    fn: (value: Value<T, V>) => U,
  ) => Eval<V, U extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<U>, Err<T>>;
  /**
   * Maps a `Result<T, E>` to a `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   *
   * @example
   * ok(2).mapErr((v) => v * 2).unwrap(); // 2
   * err(2).mapErr((v) => v * 2).unwrapErr(); // 4
   */
  mapErr: <F>(
    fn: (error: Error<T, V>) => F,
  ) => Eval<V, Ok<T>, F extends Promise<infer TValue> ? AsyncErr<TValue> : Err<F>>;
  /**
   * Returns the provided default (if `err`), or applies a function to the contained value (if `ok`).
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `mapOrElse`, which is lazily evaluated.
   *
   * @example
   * ok(2).mapOr(0, (v) => v * 2).unwrap(); // 4
   * err(2).mapOr(0, (v) => v * 2).unwrapErr() // 0
   */
  mapOr: <D, U>(defaultValue: D, fn: (value: Value<T, V>) => U) => Eval<V, U, D>;
  /**
   * Maps a `Result<T, E>` to `U` by applying fallback function `defaultFn` to an `err` value, or function `fn` to an `ok` value.
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * @example
   * ok(2).mapOrElse((_error) => 42, (v) => v * 2).unwrap(); // 4
   * err(2).mapOrElse((_error) => 42, (v) => v * 2).unwrapErr() // 42
   */
  mapOrElse: <D, U>(
    defaultFn: (error: Error<T, V>) => D,
    fn: (value: Value<T, V>) => U,
  ) => Eval<V, U, D>;

  // Boolean operators

  /**
   * Returns `res` if the result is `ok`, otherwise returns its own `err` value.
   *
   * * If you are passing the result of a function call to `res`, it is recommended to use `andThen`, which is lazily evaluated.
   *
   * @example
   * err('early error').and(ok('late value')).unwrapErr(); // 'early error'
   * err('early error').and(err('late error')).unwrapErr(); // 'early error'
   * ok('early value').and(err('late error')).unwrapErr(); // 'late error'
   * ok('early value').and(ok('late value')).unwrap(); // 'late value'
   */
  and: <B extends AnyResult>(resB: B) => Eval<V, B, Err<T>>;
  /**
   * Returns `res` if the result is `err`, otherwise returns its own `ok` value.
   *
   * * If you are passing the result of a function call to `res`, it is recommended to use `orElse`, which is lazily evaluated.
   *
   * @example
   * ok('early value').or(ok('late value')).unwrap(); // 'early value'
   * ok('early value').or(err('late error')).unwrap(); // 'early value'
   * err('early error').or(ok('late value')).unwrap(); // 'late value'
   * err('early error').or(err('late error)).unwrapErr(); // 'late error'
   */
  or: <B extends AnyResult>(resB: B) => Eval<V, Ok<T>, B>;
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
  andThen: <B extends AnyResult>(fn: (value: Value<T, V>) => B) => Eval<V, B, Err<T>>;
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
  orElse: <B extends AnyResult>(fn: (error: Error<T, V>) => B) => Eval<V, Ok<T>, B>;

  // Rust syntax utilities

  /**
   * Emulates Rust's `match` syntax by facilitating a pattern match, forcing
   * the user to account for both the success and the error state.
   *
   * @example
   * ok('value').match({
   *   ok: (value) => `The value was: "${value}""`,
   *   err: (error) => 'Some error handling',
   * }); // 'The value was: "value"'
   *
   * err('error').match({
   *   ok: (value) => `The value was: "${value}""`,
   *   err: (error) => 'Some error handling',
   * }); // 'Some error handling'
   */
  match: <U>(m: ResultMatch<Value<T, V>, Error<T, V>, U>) => U;
  /**
   * Serialize the result into an object literal that can be passed over the network
   *
   * @example
   * ok('value').serialize() // { isOk: true, isErr: false, value: 'value' }
   * err('error').serialize() // { isOk: false, isErr: true, error: 'error' }
   */
  serialize: () => {
    isOk: Eval<V, true, false>;
    isErr: Eval<V, false, true>;
  } & Eval<V, { value: Value<T, V> }, { error: Error<T, V> }>;
};
