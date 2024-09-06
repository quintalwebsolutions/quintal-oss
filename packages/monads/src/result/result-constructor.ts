import type { None, Some } from '../option';
import type { MaybePromise } from '../util';
import type { AsyncErr, AsyncOk } from './async-result';
import type { Err, Ok } from './result';
import type { AnyResult, ResultMatch, SerializedErr, SerializedOk } from './util';

type Variant = 'OK' | 'ERR';
type EvaluateVariant<TVariant extends Variant, TIsOk, TIsErr> = TVariant extends 'OK'
  ? TIsOk
  : TVariant extends 'ERR'
    ? TIsErr
    : never;

type Value<TValue, TVariant extends Variant> = TVariant extends 'OK' ? TValue : never;
type Error<TError, TVariant extends Variant> = TVariant extends 'ERR' ? TError : never;

/** A data structure that represents either success or failure */
export type ResultConstructor<TValue, TVariant extends Variant> = {
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
  isOk: EvaluateVariant<TVariant, true, false>;
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
  isErr: EvaluateVariant<TVariant, false, true>;
  /**
   * Returns `true` if the result is `ok` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isOkAnd(() => true); // true
   * ok('value').isOkAnd(() => false); // false
   * err('error').isOkAnd(() => true); // false
   * err('error').isOkAnd(() => false); // false
   */
  isOkAnd: <TPredicate extends MaybePromise<boolean>>(
    fn: (value: Value<TValue, TVariant>) => TPredicate,
  ) => EvaluateVariant<TVariant, TPredicate, false>;
  /**
   * Returns `true` if the result is `err` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isErrAnd(() => true); // false
   * ok('value').isErrAnd(() => false); // false
   * err('error').isErrAnd(() => true); // true
   * err('error').isErrAnd(() => false); // false
   */
  isErrAnd: <TPredicate extends MaybePromise<boolean>>(
    fn: (error: Error<TValue, TVariant>) => TPredicate,
  ) => EvaluateVariant<TVariant, false, TPredicate>;
  /**
   * Calls the provided closure with the contained value (if `ok`).
   *
   * @example
   * ok('value').inspect((value) => console.log(value)); // logs 'value' to the console
   * err('error').inspect((value) => console.log(value)); // Doesn't do anything
   */
  inspect: (
    fn: (value: Value<TValue, TVariant>) => MaybePromise<void>,
  ) => ResultConstructor<TValue, TVariant>;
  /**
   * Calls the provided closure with the contained error (if `err`).
   *
   * @example
   * ok('value').inspectErr((value) => console.log(value)); // Doesn't do anything
   * err('error').inspectErr((value) => console.log(value)); // Logs 'error' to the console
   */
  inspectErr: (
    fn: (error: Error<TValue, TVariant>) => MaybePromise<void>,
  ) => ResultConstructor<TValue, TVariant>;

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
  expect: (message: string) => Value<TValue, TVariant>;
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
  expectErr: (message: string) => Error<TValue, TVariant>;
  /**
   * Returns the contained `ok` value, or throws the value if it is an `err`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * ok('value').unwrap(); // 'value'
   * err('error').unwrap(); // Throws 'error'
   */
  unwrap: () => Value<TValue, TVariant>;
  /**
   * Returns the contained `err` value, or throws the value if it is is an `ok`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * ok('value').unwrapErr(); // Throws 'value'
   * err('error').unwrapErr(); // 'error'
   */
  unwrapErr: () => Error<TValue, TVariant>;
  /**
   * Returns the contained `ok` value, or a provided default.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `unwrapOrElse`, which is lazily evaluated.
   *
   * @example
   * ok('value').unwrapOr('default'); // 'value'
   * err('error').unwrapOr('default'); // 'default'
   */
  unwrapOr: <TDefaultValue>(
    defaultValue: TDefaultValue,
  ) => EvaluateVariant<TVariant, TValue, TDefaultValue>;
  /**
   * Returns the contained `ok` value, or computes a default from a provided closure.
   *
   * @example
   * ok('value').unwrapOrElse((_error) => 'default'); // 'value'
   * err('error').unwrapOrElse((_error) => 'default'); // 'default'
   */
  unwrapOrElse: <TDefaultValue>(
    fn: (error: Error<TValue, TVariant>) => TDefaultValue,
  ) => EvaluateVariant<TVariant, TValue, TDefaultValue>;

  // Transforming the contained value

  /**
   * Converts from `Result<T, E>` to `Option<T>`, discarding the error, if any.
   *
   * @example
   * ok('value').ok(); // some('value')
   * err('error').ok(); // none
   */
  ok: () => EvaluateVariant<TVariant, Some<TValue>, None>;
  /**
   * Converts from `Result<T, E>` to `Option<E>`, discarding the success value, if any.
   *
   * @example
   * ok('value').err(); // none
   * err('error').err(); // some('error')
   */
  err: () => EvaluateVariant<TVariant, None, Some<TValue>>;
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
  transpose: () => EvaluateVariant<
    TVariant,
    TValue extends None ? TValue : Some<Ok<TValue extends Some<infer TSome> ? TSome : TValue>>,
    Some<Err<TValue>>
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
  flatten: () => EvaluateVariant<
    TVariant,
    TValue extends AnyResult ? TValue : Ok<TValue>,
    Err<TValue>
  >;
  /**
   * Maps a `Result<T, E>` to a `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   *
   * @example
   * ok(2).map((v) => v * 2).unwrap(); // 4
   * err(2).map((v) => v * 2).unwrapErr(); // 2
   */
  map: <TMappedValue>(
    fn: (value: Value<TValue, TVariant>) => TMappedValue,
  ) => EvaluateVariant<
    TVariant,
    TMappedValue extends Promise<infer TValue> ? AsyncOk<TValue> : Ok<TMappedValue>,
    Err<TValue>
  >;
  /**
   * Maps a `Result<T, E>` to a `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   *
   * @example
   * ok(2).mapErr((v) => v * 2).unwrap(); // 2
   * err(2).mapErr((v) => v * 2).unwrapErr(); // 4
   */
  mapErr: <TMappedError>(
    fn: (error: Error<TValue, TVariant>) => TMappedError,
  ) => EvaluateVariant<
    TVariant,
    Ok<TValue>,
    TMappedError extends Promise<infer TValue> ? AsyncErr<TValue> : Err<TMappedError>
  >;
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
  mapOr: <TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    fn: (value: Value<TValue, TVariant>) => TMappedValue,
  ) => EvaluateVariant<TVariant, TMappedValue, TDefaultValue>;
  /**
   * Maps a `Result<T, E>` to `U` by applying fallback function `defaultFn` to an `err` value, or function `fn` to an `ok` value.
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * @example
   * ok(2).mapOrElse((_error) => 42, (v) => v * 2).unwrap(); // 4
   * err(2).mapOrElse((_error) => 42, (v) => v * 2).unwrapErr() // 42
   */
  mapOrElse: <TDefaultValue, TMappedValue>(
    defaultFn: (error: Error<TValue, TVariant>) => TDefaultValue,
    fn: (value: Value<TValue, TVariant>) => TMappedValue,
  ) => EvaluateVariant<TVariant, TMappedValue, TDefaultValue>;

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
  and: <TResultB extends AnyResult>(
    resultB: TResultB,
  ) => EvaluateVariant<TVariant, TResultB, Err<TValue>>;
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
  or: <TResultB extends AnyResult>(
    resultB: TResultB,
  ) => EvaluateVariant<TVariant, Ok<TValue>, TResultB>;
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
  andThen: <TResultB extends AnyResult>(
    fn: (value: Value<TValue, TVariant>) => TResultB,
  ) => EvaluateVariant<TVariant, TResultB, Err<TValue>>;
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
  orElse: <TResultB extends AnyResult>(
    fn: (error: Error<TValue, TVariant>) => TResultB,
  ) => EvaluateVariant<TVariant, Ok<TValue>, TResultB>;

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
  match: <TOutputOk, TOutputErr>(
    match: ResultMatch<Value<TValue, TVariant>, Error<TValue, TVariant>, TOutputOk, TOutputErr>,
  ) => EvaluateVariant<TVariant, TOutputOk, TOutputErr>;
  /**
   * Serialize the result into an object literal that can be passed over the network
   *
   * @example
   * ok('value').serialize() // { type: 'ok', value: 'value' }
   * err('error').serialize() // { type: 'err', error: 'error' }
   */
  serialize: () => EvaluateVariant<
    TVariant,
    SerializedOk<Value<TValue, TVariant>>,
    SerializedErr<Error<TValue, TVariant>>
  >;
};
