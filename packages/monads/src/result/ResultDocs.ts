import type { AnyOption, AsyncNone, AsyncResult, AsyncSome, None, Some } from '..';
import type { MaybePromise } from '../util';
import type { Err } from './Err';
import type { Ok } from './Ok';
import type {
  AnyResult,
  AnySyncResult,
  AsyncErr,
  AsyncOk,
  ResultMatch,
  ResultTernary,
  SerializedErr,
  SerializedOk,
  ValueFromErr,
  ValueFromOk,
} from './types';

type ResultVariant = 'ok' | 'err' | 'async';

type EvaluateResultVariant<
  TVariant extends ResultVariant,
  TMap extends Record<ResultVariant, unknown>,
> = TMap[TVariant];

type ResultValue<TValue, TVariant extends ResultVariant> = EvaluateResultVariant<
  TVariant,
  { ok: TValue; err: never; async: ValueFromOk<TValue> }
>;

type ResultError<TValue, TVariant extends ResultVariant> = EvaluateResultVariant<
  TVariant,
  { ok: never; err: TValue; async: ValueFromErr<TValue> }
>;

/** A data structure that represents either success or failure */
export type ResultDocs<TValue, TResultVariant extends ResultVariant> = {
  // #region Querying the contained value
  /**
   * Is `true` if the result is `ok`.
   *
   * This property can be used to type-narrow the result type.
   *
   * @example
   * // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `unknown`
   * const r = resultFromThrowable(() => true);
   *
   * if (r.isOk) {
   *   // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `never`
   * } else {
   *   // `r.unwrap()` is of type `never`, `r.unwrapErr()` is of type `unknown`
   * }
   */
  isOk: EvaluateResultVariant<
    TResultVariant,
    { ok: true; err: false; async: Promise<ResultTernary<TValue, true, false>> }
  >;
  /**
   * Is `true` if the result is `err`.
   *
   * This property can be used to type-narrow the result type.
   *
   * @example
   * // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `unknown`
   * const r = resultFromThrowable(() => true);
   *
   * if (r.isErr) {
   *   // `r.unwrap()` is of type `never`, `r.unwrapErr()` is of type `unknown`
   * } else {
   *   // `r.unwrap()` is of type `boolean`, `r.unwrapErr()` is of type `never`
   * }
   */
  isErr: EvaluateResultVariant<
    TResultVariant,
    { ok: false; err: true; async: Promise<ResultTernary<TValue, false, true>> }
  >;
  /**
   * Returns `true` if the result is `ok` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isOkAnd(() => true); // true
   * ok('value').isOkAnd(() => false); // false
   * await ok('value').isOkAnd(async () => true); // true
   * await ok('value').isOkAnd(async () => false); // false
   * err('error').isOkAnd(() => true); // false
   * err('error').isOkAnd(() => false); // false
   * err('error').isOkAnd(async () => true); // false
   * err('error').isOkAnd(async () => false); // false
   */
  isOkAnd: <TPredicate extends MaybePromise<boolean>>(
    fn: (value: ResultValue<TValue, TResultVariant>) => TPredicate,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TPredicate;
      err: false;
      async: Promise<ResultTernary<TValue, Awaited<TPredicate>, false>>;
    }
  >;
  /**
   * Returns `true` if the result is `err` and the value inside of it matches a predicate.
   *
   * @example
   * ok('value').isErrAnd(() => true); // false
   * ok('value').isErrAnd(() => false); // false
   * ok('value').isErrAnd(async () => true); // false
   * ok('value').isErrAnd(async () => false); // false
   * err('error').isErrAnd(() => true); // true
   * err('error').isErrAnd(() => false); // false
   * await err('error').isErrAnd(async () => true); // true
   * await err('error').isErrAnd(async () => false); // false
   */
  isErrAnd: <TPredicate extends MaybePromise<boolean>>(
    fn: (error: ResultError<TValue, TResultVariant>) => TPredicate,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: false;
      err: TPredicate;
      async: Promise<ResultTernary<TValue, false, Awaited<TPredicate>>>;
    }
  >;
  /**
   * Calls the provided closure with the contained value (if `ok`).
   *
   * @example
   * ok('value').inspect((value) => console.log(value)); // logs 'value' to the console
   * ok('value').inspect(async (value) => console.log(value)); // logs 'value' to the console asynchronously
   * err('error').inspect((value) => console.log(value)); // Doesn't do anything
   */
  inspect: (
    fn: (value: ResultValue<TValue, TResultVariant>) => MaybePromise<void>,
  ) => ResultDocs<TValue, TResultVariant>;
  /**
   * Calls the provided closure with the contained error (if `err`).
   *
   * @example
   * ok('value').inspectErr((value) => console.log(value)); // Doesn't do anything
   * err('error').inspectErr((value) => console.log(value)); // Logs 'error' to the console
   * err('error').inspectErr(async (value) => console.log(value)); // Logs 'error' to the console asynchronously
   */
  inspectErr: (
    fn: (error: ResultError<TValue, TResultVariant>) => MaybePromise<void>,
  ) => ResultDocs<TValue, TResultVariant>;
  // #endregion

  // #region Extracting the contained value
  /**
   * Returns the contained `ok` value, or throws a given error message it is an `err`.
   *
   * It is recommended that expect messages are used to describe the reason you expect the `Result` to be `ok` (hint: use the word 'should').
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * ok('value').expect('Value should be ok'); // 'value'
   * err('error').expect('Value should be ok'); // Throws 'Value should be ok'
   * await asyncOk('value').expect('Value should be ok'); // 'value'
   * await asyncErr('error').expect('Value should be ok'); // Throws 'Value should be ok'
   */
  expect: (
    message: string,
  ) => EvaluateResultVariant<
    TResultVariant,
    { ok: TValue; err: never; async: Promise<ValueFromOk<TValue>> }
  >;
  /**
   * Returns the contained `err` value, or throws the given error message it is an `ok`.
   *
   * It is recommended that expect messages are used to describe the reason you expect the `Result` to be `err` (hint: use the word 'should').
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * ok('value').expectErr('Value should be err'); // Throws 'Value should be err'
   * err('error').expectErr('Value should be err'); // 'error'
   * await asyncOk('value').expectErr('Value should be err'); // Throws 'Value should be err'
   * await asyncErr('error').expectErr('Value should be err'); // 'error'
   */
  expectErr: (
    message: string,
  ) => EvaluateResultVariant<
    TResultVariant,
    { ok: never; err: TValue; async: Promise<ValueFromErr<TValue>> }
  >;
  /**
   * Returns the contained `ok` value, or throws the value if it is an `err`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `ok`, `unwrapOr`, or `unwrapOrElse`.
   *
   * @example
   * ok('value').unwrap(); // 'value'
   * err('error').unwrap(); // Throws 'error'
   * await asyncOk('value').unwrap(); // 'value'
   * await asyncErr('error').unwrap(); // Throws 'error'
   */
  unwrap: () => EvaluateResultVariant<
    TResultVariant,
    { ok: TValue; err: never; async: Promise<ValueFromOk<TValue>> }
  >;
  /**
   * Returns the contained `err` value, or throws the value if it is is an `ok`.
   *
   * * Because this function may throw, its use is generally discouraged. Instead, prefer to use `err`.
   *
   * @example
   * ok('value').unwrapErr(); // Throws 'value'
   * err('error').unwrapErr(); // 'error'
   * await asyncOk('value').unwrapErr(); // Throws 'value'
   * await asyncErr('error').unwrapErr(); // 'error'
   */
  unwrapErr: () => EvaluateResultVariant<
    TResultVariant,
    { ok: never; err: TValue; async: Promise<ValueFromErr<TValue>> }
  >;
  /**
   * Returns the contained `ok` value, or a provided default.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `unwrapOrElse`, which is lazily evaluated.
   *
   * @example
   * ok('value').unwrapOr('default'); // 'value'
   * err('error').unwrapOr('default'); // 'default'
   * await asyncOk('value').unwrapOr('default'); // 'value'
   * await asyncErr('error').unwrapOr('default'); // 'default'
   */
  unwrapOr: <TDefaultValue>(defaultValue: TDefaultValue) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TValue;
      err: TDefaultValue;
      async: Promise<ResultTernary<TValue, ValueFromOk<TValue>, Awaited<TDefaultValue>>>;
    }
  >;
  /**
   * Returns the contained `ok` value, or computes a default from a provided closure.
   *
   * @example
   * ok('value').unwrapOrElse((_error) => 'default'); // 'value'
   * ok('value').unwrapOrElse(async (_error) => 'default'); // 'value'
   * err('error').unwrapOrElse((_error) => 'default'); // 'default'
   * await err('error').unwrapOrElse(async (_error) => 'default'); // 'default'
   * await asyncOk('value').unwrapOrElse((_error) => 'default'); // 'value'
   * await asyncErr('error').unwrapOrElse((_error) => 'default'); // 'default'
   */
  unwrapOrElse: <TDefaultValue>(
    fn: (error: ResultError<TValue, TResultVariant>) => TDefaultValue,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TValue;
      err: TDefaultValue;
      async: Promise<ResultTernary<TValue, ValueFromOk<TValue>, Awaited<TDefaultValue>>>;
    }
  >;
  // #endregion

  // #region Transforming the contained value
  /**
   * Converts from `Result<T, E>` to `Option<T>`, discarding the error, if any.
   *
   * @example
   * ok('value').ok(); // some('value')
   * err('error').ok(); // none
   * await asyncOk('value').ok(); // some('value')
   * await asyncErr('error').ok(); // none
   */
  ok: () => EvaluateResultVariant<
    TResultVariant,
    {
      ok: Some<TValue>;
      err: None;
      async: ResultTernary<TValue, AsyncSome<ValueFromOk<TValue>>, AsyncNone>;
    }
  >;
  /**
   * Converts from `Result<T, E>` to `Option<E>`, discarding the success value, if any.
   *
   * @example
   * ok('value').err(); // none
   * err('error').err(); // some('error')
   * await asyncOk('value').err(); // none
   * await asyncErr('error').err(); // some('error')
   */
  err: () => EvaluateResultVariant<
    TResultVariant,
    {
      ok: None;
      err: Some<TValue>;
      async: ResultTernary<TValue, AsyncNone, AsyncSome<ValueFromErr<TValue>>>;
    }
  >;
  /**
   * Transposes a `Result` of an `Option` into an `Option` of a `Result`.
   *
   * @example
   * ok(none).transpose(); // none
   * ok(asyncNone).transpose(); // asyncNone
   * ok(some('value')).transpose(); // some(ok('value'))
   * ok(asyncSome('value')).transpose(); // asyncSome(ok('value'))
   * ok('value').transpose(); // some(ok('value'))
   * err(none).transpose(); // some(err(none))
   * err(some('value')).transpose(); // some(err(some('value')))
   * err('error').transpose(); // some(err('error'))
   * asyncOk(none).transpose(); // asyncNone
   * asyncOk(some('value')).transpose(); // asyncSome(ok('value'))
   */
  transpose: () => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TValue extends None | AsyncNone
        ? TValue
        : TValue extends Some<infer TSome>
          ? Some<Ok<TSome>>
          : TValue extends AsyncSome<infer TSome>
            ? AsyncSome<Ok<TSome>>
            : Some<Ok<TValue>>;
      err: Some<Err<TValue>>;
      async: ResultTernary<
        TValue,
        TValue extends Ok<infer TOption extends AnyOption>
          ? TOption extends None | AsyncNone
            ? AsyncNone
            : TOption extends Some<infer TSome>
              ? AsyncSome<Ok<TSome>>
              : TOption extends AsyncSome<infer TSome>
                ? AsyncSome<Ok<TSome>>
                : never
          : AsyncSome<Ok<ValueFromOk<TValue>>>,
        AsyncSome<TValue>
      >;
    }
  >;
  /**
   * Flattens at most one level of `Result` nesting.
   *
   * @example
   * ok('value').flatten(); // ok('value')
   * err('error').flatten(); // err('error')
   * ok(ok('value')).flatten(); // ok('value')
   * ok(err('error')).flatten(); // err('error')
   * asyncOk(ok('value')).flatten(); // asyncOk('value')
   * asyncErr(ok('value')).flatten(); // asyncErr(ok('value'))
   * err(ok('value')).flatten(); // err(ok('value'))
   * err(err('error')).flatten(); // err(err('error'))
   * ok(ok(ok('value'))).flatten(); // ok(ok('value'))
   * ok(ok(ok('value'))).flatten().flatten(); // ok('value')
   */
  flatten: () => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TValue extends AnyResult ? TValue : Ok<TValue>;
      err: Err<TValue>;
      async: ResultTernary<
        TValue,
        ValueFromOk<TValue> extends AnySyncResult
          ? AsyncResult<ValueFromOk<TValue>>
          : ValueFromOk<TValue> extends AnyResult
            ? ValueFromOk<TValue>
            : AsyncResult<Ok<ValueFromOk<TValue>>>,
        AsyncResult<Err<ValueFromErr<TValue>>>
      >;
    }
  >;
  /**
   * Maps a `Result<T, E>` to a `Result<U, E>` by applying a function to a contained `ok` value, leaving an `err` value untouched.
   *
   * This function can be used to compose the results of two functions.
   *
   * @example
   * ok(2).map((v) => v * 2).unwrap(); // 4
   * err(2).map((v) => v * 2).unwrapErr(); // 2
   * await ok(2).map(async (v) => v * 2).unwrap(); // 4
   * await err(2).map(async (v) => v * 2).unwrapErr(); // 2
   * await asycOk(2).map((v) => v * 2).unwrap(); // 4
   * await asyncErr(2).map((v) => v * 2).unwrapErr(); // 2
   */
  map: <TMappedValue>(
    fn: (value: ResultValue<TValue, TResultVariant>) => TMappedValue,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TMappedValue extends Promise<infer TAwaitedMappedValue>
        ? AsyncOk<TAwaitedMappedValue>
        : Ok<TMappedValue>;
      err: Err<TValue>;
      async: ResultTernary<TValue, AsyncOk<Awaited<TMappedValue>>, AsyncErr<ValueFromErr<TValue>>>;
    }
  >;
  /**
   * Maps a `Result<T, E>` to a `Result<T, F>` by applying a function to a contained `err` value, leaving an `ok` value untouched.
   *
   * This function can be used to pass through a successful result while handling an error.
   *
   * @example
   * ok(2).mapErr((v) => v * 2).unwrap(); // 2
   * err(2).mapErr((v) => v * 2).unwrapErr(); // 4
   * await ok(2).mapErr(async (v) => v * 2).unwrap(); // 2
   * await err(2).mapErr(async (v) => v * 2).unwrapErr(); // 4
   * await asyncOk(2).mapErr((v) => v * 2).unwrap(); // 2
   * await asyncErr(2).mapErr((v) => v * 2).unwrapErr(); // 4
   */
  mapErr: <TMappedError>(
    fn: (error: ResultError<TValue, TResultVariant>) => TMappedError,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: Ok<TValue>;
      err: TMappedError extends Promise<infer TAwaitedMappedError>
        ? AsyncErr<TAwaitedMappedError>
        : Err<TMappedError>;
      async: ResultTernary<TValue, AsyncOk<ValueFromOk<TValue>>, AsyncErr<Awaited<TMappedError>>>;
    }
  >;
  /**
   * Returns the provided default (if `err`), or applies a function to the contained value (if `ok`).
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * * If you are passing the result of a function call to `defaultValue`, it is recommended to use `mapOrElse`, which is lazily evaluated.
   *
   * @example
   * ok(2).mapOr(0, (v) => v * 2); // 4
   * err(2).mapOr(0, (v) => v * 2); // 0
   * await ok(2).mapOr(0, async (v) => v * 2); // 4
   * err(2).mapOr(0, async (v) => v * 2); // 0
   * await asyncOk(2).mapOr(0, (v) => v * 2); // 4
   * await asyncErr(2).mapOr(0, (v) => v * 2); // 0
   */
  mapOr: <TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    fn: (value: ResultValue<TValue, TResultVariant>) => TMappedValue,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TMappedValue;
      err: TDefaultValue;
      async: Promise<Awaited<ResultTernary<TValue, TMappedValue, TDefaultValue>>>;
    }
  >;
  /**
   * Maps a `Result<T, E>` to `U` by applying fallback function `defaultFn` to an `err` value, or function `fn` to an `ok` value.
   *
   * This function can be used to unpack a successful result while handling an error.
   *
   * @example
   * ok(2).mapOrElse((_error) => 42, (v) => v * 2); // 4
   * err(2).mapOrElse((_error) => 42, (v) => v * 2); // 42
   * await ok(2).mapOrElse(async (_error) => 42, (v) => v * 2); // 4
   * err(2).mapOrElse(async (_error) => 42, (v) => v * 2); // 42
   * await asyncOk(2).mapOrElse((_error) => 42, (v) => v * 2); // 4
   * await asyncErr(2).mapOrElse((_error) => 42, (v) => v * 2); // 42
   */
  mapOrElse: <TDefaultValue, TMappedValue>(
    defaultFn: (error: ResultError<TValue, TResultVariant>) => TDefaultValue,
    fn: (value: ResultValue<TValue, TResultVariant>) => TMappedValue,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TMappedValue;
      err: TDefaultValue;
      async: Promise<Awaited<ResultTernary<TValue, TMappedValue, TDefaultValue>>>;
    }
  >;
  // #endregion

  // #region Boolean operators
  /**
   * Returns `res` if the result is `ok`, otherwise returns its own `err` value.
   *
   * * If you are passing the result of a function call to `res`, it is recommended to use `andThen`, which is lazily evaluated.
   *
   * @example
   * ok('early value').and(ok('late value')).unwrap(); // 'late value'
   * ok('early value').and(err('late error')).unwrapErr(); // 'late error'
   * err('early error').and(ok('late value')).unwrapErr(); // 'early error'
   * err('early error').and(err('late error')).unwrapErr(); // 'early error'
   *
   * @example
   * await ok('early value').and(Promise.resolve(ok('late value'))).unwrap(); // 'late value'
   * await ok('early value').and(Promise.resolve(err('late error'))).unwrapErr(); // 'late error'
   * err('early error').and(Promise.resolve(ok('late value'))).unwrapErr(); // 'early error'
   * err('early error').and(Promise.resolve(err('late error'))).unwrapErr(); // 'early error'
   */
  and: <TResultB extends AnyResult | Promise<AnySyncResult>>(
    resultB: TResultB,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
        ? AsyncResult<TInternalResultB>
        : TResultB;
      err: Err<TValue>;
      async: AsyncResult<ResultTernary<TValue, Awaited<TResultB>, Err<ValueFromErr<TValue>>>>;
    }
  >;
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
   *
   * @example
   * ok('early value').or(Promise.resolve(ok('late value'))).unwrap(); // 'early value'
   * ok('early value').or(Promise.resolve(err('late error'))).unwrap(); // 'early value'
   * await err('early error').or(Promise.resolve(ok('late value'))).unwrap(); // 'late value'
   * await err('early error').or(Promise.resolve(err('late error'))).unwrapErr(); // 'late error'
   */
  or: <TResultB extends AnyResult | Promise<AnySyncResult>>(
    resultB: TResultB,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: Ok<TValue>;
      err: TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
        ? AsyncResult<TInternalResultB>
        : TResultB;
      async: AsyncResult<ResultTernary<TValue, Ok<ValueFromOk<TValue>>, Awaited<TResultB>>>;
    }
  >;
  /**
   * Calls `fn` if the result is `ok`, otherwise return its own `err` value.
   *
   * This function can be used for control flow based on Result values.
   *
   * @example
   * ok('early value').andThen(() => ok('late value')).unwrap(); // 'late value'
   * ok('early value').andThen(() => err('late error')).unwrapErr(); // 'late error'
   * err('early error').andThen(() => ok('late value')).unwrapErr(); // 'early error'
   * err('early error').andThen(() => err('late error')).unwrapErr(); // 'early error'
   *
   * @example
   * await ok('early value').andThen(async () => ok('late value')).unwrap(); // 'late value'
   * await ok('early value').andThen(async () => err('late error')).unwrapErr(); // 'late error'
   * err('early error').andThen(async () => ok('late value')).unwrapErr(); // 'early error'
   * err('early error').andThen(async () => err('late error')).unwrapErr(); // 'early error'
   */
  andThen: <TResultB extends AnyResult | Promise<AnySyncResult>>(
    fn: (value: ResultValue<TValue, TResultVariant>) => TResultB,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
        ? AsyncResult<TInternalResultB>
        : TResultB;
      err: Err<TValue>;
      async: AsyncResult<ResultTernary<TValue, Awaited<TResultB>, Err<ValueFromErr<TValue>>>>;
    }
  >;
  /**
   * Calls `fn` if the result is `err`, otherwise returns its own `ok` value.
   *
   * This function can be used for control flow based on result values.
   *
   * @example
   * ok('early value').orElse(() => ok('late value')).unwrap(); // 'early value'
   * ok('early value').orElse(() => err('late error')).unwrap(); // 'early value'
   * err('early error').orElse(() => ok('late value')).unwrap(); // 'late value'
   * err('early error').orElse(() => err('late error')).unwrapErr(); // 'late error'
   *
   * @example
   * await ok('early value').orElse(async () => ok('late value')).unwrap(); // 'early value'
   * await ok('early value').orElse(async () => err('late error')).unwrap(); // 'early value'
   * await err('early error').orElse(async () => ok('late value')).unwrap(); // 'late value'
   * await err('early error').orElse(async () => err('late error')).unwrapErr(); // 'late error'
   */
  orElse: <TResultB extends AnyResult | Promise<AnySyncResult>>(
    fn: (error: ResultError<TValue, TResultVariant>) => TResultB,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: Ok<TValue>;
      err: TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
        ? AsyncResult<TInternalResultB>
        : TResultB;
      async: AsyncResult<ResultTernary<TValue, Ok<ValueFromOk<TValue>>, Awaited<TResultB>>>;
    }
  >;
  // #endregion

  // #region Rust syntax utilities
  /**
   * Emulates Rust's `match` syntax by facilitating a pattern match, forcing
   * the user to account for both the success and the error state.
   *
   * @example
   * ok('value').match({
   *   ok: (value) => `The value is: "${value}""`,
   *   err: (error) => 'Some error handling',
   * }); // 'The value is: "value"'
   *
   * err('error').match({
   *   ok: (value) => `The value is: "${value}""`,
   *   err: (error) => 'Some error handling',
   * }); // 'Some error handling'
   *
   * await asyncOk('value').match({
   *   ok: (value) => `The value is: "${value}""`,
   *   err: (error) => 'Some error handling',
   * }); // 'The value is: "value"'
   *
   * await asyncErr('error').match({
   *   ok: (value) => `The value is: "${value}""`,
   *   err: (error) => 'Some error handling',
   * }); // 'Some error handling'
   */
  match: <TOutputOk, TOutputErr>(
    match: ResultMatch<
      ResultValue<TValue, TResultVariant>,
      ResultError<TValue, TResultVariant>,
      TOutputOk,
      TOutputErr
    >,
  ) => EvaluateResultVariant<
    TResultVariant,
    {
      ok: TOutputOk;
      err: TOutputErr;
      async: Promise<ResultTernary<TValue, TOutputOk, TOutputErr>>;
    }
  >;
  /**
   * Serialize the result into an object literal that can be passed over the network
   *
   * @example
   * ok('value').serialize() // { type: 'ok', value: 'value' }
   * err('error').serialize() // { type: 'err', error: 'error' }
   * await asyncOk('value').serialize() // { type: 'ok', value: 'value' }
   * await asyncErr('error').serialize() // { type: 'err', error: 'error' }
   */
  serialize: () => EvaluateResultVariant<
    TResultVariant,
    {
      ok: SerializedOk<ResultValue<TValue, TResultVariant>>;
      err: SerializedErr<ResultError<TValue, TResultVariant>>;
      async: Promise<
        ResultTernary<
          TValue,
          SerializedOk<ValueFromOk<TValue>>,
          SerializedErr<ValueFromErr<TValue>>
        >
      >;
    }
  >;
  // #endregion
};
