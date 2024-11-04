import type { None, Some } from '../option';
import type { Err } from './Err';
import type { Ok } from './Ok';
import type { AnyResult, ResultMatch, SerializedErr, SerializedOk } from './util';

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
transpose: () =>
  EvaluateVariant<
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
flatten: () =>
  EvaluateVariant<TVariant, TValue extends AnyResult ? TValue : Ok<TValue>, Err<TValue>>;

export type ResultDocs<TValue, TVariant extends Variant> = {
  // Boolean operators

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
   * const square = (x: number) => x === 42 ? err('bad number') : ok(x * x);
   * ok(2).andThen(square).unwrap(); // 4
   * ok(42).andThen(square).unwrapErr(); // 'bad number'
   * err('not a number').andThen(square).unwrapErr(); // 'not a number'
   */
  // TODO allow to pass a Promise<TResultB> to return an AsyncResult
  andThen: <TResultB extends AnyResult>(
    fn: (value: Value<TValue, TVariant>) => TResultB,
  ) => EvaluateVariant<TVariant, TResultB, Err<TValue>>;
  /**
   * Calls `fn` if the result is `err`, otherwise returns its own `ok` value.
   *
   * This function can be used for control flow based on result values.
   *
   * @example
   * const square = (x: number) => ok(x * x);
   * const error = (x: number) => err(x);
   * ok(2).orElse(square).orElse(square).unwrap(); // 2
   * ok(2).orElse(error).orElse(square).unwrap(); // 2
   * err(2).orElse(square).orElse(error).unwrap(); // 4
   * err(3).orElse(error).orElse(error).unwrapErr(); // 3
   */
  // TODO allow to pass a Promise<TResultB> to return an AsyncResult
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
  /**
   * Merge the result with another result, returning the first error encountered
   *
   * @example
   * ok('value1').merge(ok('value2')).unwrap(); // ['value1', 'value2']
   * ok('value1').merge(err('error2')).unwrap(); // 'error2'
   * err('error1').merge(ok('value2')).unwrap(); // 'error1'
   * err('error1').merge(err('error2')).unwrap(); // 'error1'
   */
  merge: <TResultB extends AnyResult>(
    resultB: TResultB,
    // TODO if resultB is AsyncResult, output should be one merged AsyncResult
  ) => EvaluateVariant<
    TVariant,
    TResultB extends Ok<infer TValueB> ? Ok<[TValue, TValueB]> : TResultB,
    Err<TValue>
  >;
};
