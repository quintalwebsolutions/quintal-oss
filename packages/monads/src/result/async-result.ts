import type { InferredValue, MaybePromise } from '../util';
import { type Err, type Ok, type Result, err, ok, resultFromSerialized } from './result';
import type {
  AnyResult,
  AnySerializedResult,
  ResultFromSerialized,
  ResultMatch,
  SerializedErr,
  SerializedOk,
} from './util';

type Value<TResult extends AnyResult> = ReturnType<TResult['unwrap']>;
type Error<TResult extends AnyResult> = ReturnType<TResult['unwrapErr']>;
type IsOk<TResult extends AnyResult, TIsOk, TIsErr> = TResult extends Ok<unknown> ? TIsOk : TIsErr;

// TODO relate this to the resultconstructor to share documentation
export class AsyncResult<TResult extends AnyResult> {
  private _promise: Promise<TResult>;

  constructor(promise: Promise<TResult>) {
    this._promise = promise;
  }

  // biome-ignore lint/suspicious/noThenProperty: We explicitly want to make this class thenable
  then<TResult1 = TResult, TResult2 = never>(
    onfulfilled?: (value: TResult) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  get isOk(): Promise<TResult['isOk']> {
    return this.then((res) => res.isOk);
  }

  get isErr(): Promise<TResult['isErr']> {
    return this.then((res) => res.isErr);
  }

  isOkAnd<TPredicate extends MaybePromise<boolean>>(
    fn: (value: Value<TResult>) => TPredicate,
  ): Promise<IsOk<TResult, Awaited<TPredicate>, false>> {
    return this.then(
      async (res) => (await res.isOkAnd(fn)) as IsOk<TResult, Awaited<TPredicate>, false>,
    );
  }

  isErrAnd<TPredicate extends MaybePromise<boolean>>(
    fn: (error: Error<TResult>) => TPredicate,
  ): Promise<IsOk<TResult, false, Awaited<TPredicate>>> {
    return this.then(
      async (res) => (await res.isErrAnd(fn)) as IsOk<TResult, false, Awaited<TPredicate>>,
    );
  }

  inspect(fn: (value: Value<TResult>) => void): typeof this {
    this.then((res) => res.inspect(fn));
    return this;
  }

  inspectErr(fn: (error: Error<TResult>) => void): typeof this {
    this.then((res) => res.inspectErr(fn));
    return this;
  }

  expect(message: string): Promise<ReturnType<TResult['expect']>> {
    return this.then((res) => res.expect(message));
  }

  expectErr(message: string): Promise<ReturnType<TResult['expectErr']>> {
    return this.then((res) => res.expectErr(message));
  }

  // TODO Promise<Result<>> => AsyncResult<Result<>>
  // TODO expect(asyncErr(okVal).unwrapErr().unwrap()).resolves.toBe('value');
  // unwrap(): Value<R> extends AnyResult
  //   ? [Value<R>] extends [never]
  //     ? Promise<never>
  //     : AsyncResult<Awaited<Value<R>>>
  //   : Promise<Awaited<Value<R>>> {
  unwrap(): Promise<Awaited<Value<TResult>>> {
    return this.then((res) => res.unwrap());
  }

  unwrapErr(): Promise<Awaited<Error<TResult>>> {
    return this.then((res) => res.unwrapErr());
  }

  unwrapOr<TDefaultValue>(
    defaultValue: TDefaultValue,
  ): Promise<IsOk<TResult, Value<TResult>, Awaited<TDefaultValue>>> {
    return this.then((res) => res.unwrapOr(defaultValue));
  }

  unwrapOrElse<TDefaultValue>(
    fn: (error: Error<TResult>) => TDefaultValue,
  ): Promise<IsOk<TResult, Value<TResult>, Awaited<TDefaultValue>>> {
    return this.then((res) => res.unwrapOrElse(fn));
  }

  ok(): Promise<ReturnType<TResult['ok']>> {
    return this.then((res) => res.ok() as ReturnType<TResult['ok']>);
  }

  err(): Promise<ReturnType<TResult['err']>> {
    return this.then((res) => res.err() as ReturnType<TResult['err']>);
  }

  transpose(): Promise<ReturnType<TResult['transpose']>> {
    return this.then((res) => res.transpose());
  }

  flatten(): AsyncResult<
    IsOk<
      TResult,
      Value<TResult> extends AnyResult ? Value<TResult> : Ok<Value<TResult>>,
      Err<Error<TResult>>
    >
  > {
    return new AsyncResult(this.then((res) => res.flatten()));
  }

  map<TMappedValue>(
    fn: (value: Value<TResult>) => TMappedValue,
  ): AsyncResult<IsOk<TResult, Ok<Awaited<TMappedValue>>, Err<Error<TResult>>>> {
    return new AsyncResult(
      this.then(
        (res) => res.map(fn) as IsOk<TResult, Ok<Awaited<TMappedValue>>, Err<Error<TResult>>>,
      ),
    );
  }

  mapErr<TMappedError>(
    fn: (error: Error<TResult>) => TMappedError,
  ): AsyncResult<IsOk<TResult, Ok<Value<TResult>>, Err<Awaited<TMappedError>>>> {
    return new AsyncResult(
      this.then(
        (res) => res.mapErr(fn) as IsOk<TResult, Ok<Value<TResult>>, Err<Awaited<TMappedError>>>,
      ),
    );
  }

  mapOr<TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    fn: (value: Value<TResult>) => TMappedValue,
  ): Promise<IsOk<TResult, Awaited<TMappedValue>, Awaited<TDefaultValue>>> {
    return this.then(
      (res) =>
        res.mapOr(defaultValue, fn) as IsOk<TResult, Awaited<TMappedValue>, Awaited<TDefaultValue>>,
    );
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    defaultFn: (error: Error<TResult>) => TDefaultValue,
    fn: (value: Value<TResult>) => TMappedValue,
  ): Promise<IsOk<TResult, Awaited<TMappedValue>, Awaited<TDefaultValue>>> {
    return this.then(
      (res) =>
        res.mapOrElse(defaultFn, fn) as IsOk<
          TResult,
          Awaited<TMappedValue>,
          Awaited<TDefaultValue>
        >,
    );
  }

  and<TResultB extends AnyResult>(
    resB: TResultB,
  ): AsyncResult<IsOk<TResult, Awaited<TResultB>, Err<Error<TResult>>>> {
    return new AsyncResult(this.then((res) => res.and(resB)));
  }

  or<TResultB extends AnyResult>(
    resB: TResultB,
  ): AsyncResult<IsOk<TResult, Ok<Value<TResult>>, Awaited<TResultB>>> {
    return new AsyncResult(this.then((res) => res.or(resB)));
  }

  andThen<TResultB extends AnyResult>(
    fn: (value: Value<TResult>) => TResultB,
  ): AsyncResult<IsOk<TResult, Awaited<TResultB>, Err<Error<TResult>>>> {
    return new AsyncResult(this.then((res) => res.andThen(fn)));
  }

  orElse<TResultB extends AnyResult>(
    fn: (error: Error<TResult>) => TResultB,
  ): AsyncResult<IsOk<TResult, Ok<Value<TResult>>, Awaited<TResultB>>> {
    return new AsyncResult(this.then((res) => res.orElse(fn)));
  }

  match<TOutput>(m: ResultMatch<Value<TResult>, Error<TResult>, TOutput>): Promise<TOutput> {
    return this.then((res) => res.match(m));
  }

  serialize(): Promise<IsOk<TResult, SerializedOk<Value<TResult>>, SerializedErr<Error<TResult>>>> {
    return this.then(
      (res) =>
        res.serialize() as IsOk<
          TResult,
          SerializedOk<Value<TResult>>,
          SerializedErr<Error<TResult>>
        >,
    );
  }
}

export type AsyncOk<TValue> = AsyncResult<Ok<TValue>>;
export type AsyncErr<TError> = AsyncResult<Err<TError>>;

export function asyncOk<TValue extends InferredValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue>;
export function asyncOk<TValue>(value: TValue): AsyncOk<TValue> {
  return new AsyncResult(Promise.resolve(ok(value)));
}

export function asyncErr<TError extends InferredValue>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError>;
export function asyncErr<TError>(error: TError): AsyncErr<TError> {
  return new AsyncResult(Promise.resolve(err(error)));
}

export function asyncResultFromSerialized<TSerializedResult extends AnySerializedResult>(
  serializedResult: Promise<TSerializedResult>,
): AsyncResult<ResultFromSerialized<TSerializedResult>> {
  return new AsyncResult(serializedResult.then((value) => resultFromSerialized(value)));
}

export function asyncResultFromThrowable<TValue>(
  fn: () => Promise<TValue>,
): AsyncResult<Result<TValue, unknown>> {
  return new AsyncResult(
    fn()
      .then((value) => ok(value))
      .catch((error) => err(error)),
  );
}
