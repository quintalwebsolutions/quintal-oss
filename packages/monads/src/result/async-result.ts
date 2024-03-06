import type { MaybePromise } from '../util';
import { type Err, type Ok, type Result, err, ok } from './result';
import type { AnyResult, ResultMatch } from './util';

type Value<R extends AnyResult> = ReturnType<R['unwrap']>;
type Error<R extends AnyResult> = ReturnType<R['unwrapErr']>;
type IsOk<R extends AnyResult, TIsOk, TIsErr> = R extends Ok<unknown> ? TIsOk : TIsErr;

// TODO relate this to the resultconstructor to share documentation
export class AsyncResult<R extends AnyResult> {
  private _promise: Promise<R>;

  constructor(promise: Promise<R>) {
    this._promise = promise;
  }

  // TODO Cache promise result?
  // biome-ignore lint/nursery/noThenProperty: We explicitly want to make this class thenable
  then<TResult1 = R, TResult2 = never>(
    onfulfilled?: (value: R) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  get isOk(): Promise<R['isOk']> {
    return this.then((res) => res.isOk);
  }

  get isErr(): Promise<R['isErr']> {
    return this.then((res) => res.isErr);
  }

  isOkAnd<P extends MaybePromise<boolean>>(
    fn: (value: Value<R>) => P,
  ): Promise<IsOk<R, Awaited<P>, false>> {
    return this.then(async (res) => (await res.isOkAnd(fn)) as IsOk<R, Awaited<P>, false>);
  }

  isErrAnd<P extends MaybePromise<boolean>>(
    fn: (error: Error<R>) => P,
  ): Promise<IsOk<R, false, Awaited<P>>> {
    return this.then(async (res) => (await res.isErrAnd(fn)) as IsOk<R, false, Awaited<P>>);
  }

  inspect(fn: (value: Value<R>) => void): typeof this {
    this.then((res) => res.inspect(fn));
    return this;
  }

  inspectErr(fn: (error: Error<R>) => void): typeof this {
    this.then((res) => res.inspectErr(fn));
    return this;
  }

  expect(message: string): Promise<ReturnType<R['expect']>> {
    return this.then((res) => res.expect(message));
  }

  expectErr(message: string): Promise<ReturnType<R['expectErr']>> {
    return this.then((res) => res.expectErr(message));
  }

  // TODO Promise<Result<>> => AsyncResult<Result<>>
  // TODO expect(asyncErr(okVal).unwrapErr().unwrap()).resolves.toBe('value');
  // unwrap(): Value<R> extends AnyResult
  //   ? [Value<R>] extends [never]
  //     ? Promise<never>
  //     : AsyncResult<Awaited<Value<R>>>
  //   : Promise<Awaited<Value<R>>> {
  unwrap(): Promise<Awaited<Value<R>>> {
    return this.then((res) => res.unwrap());
  }

  unwrapErr(): Promise<Awaited<Error<R>>> {
    return this.then((res) => res.unwrapErr());
  }

  unwrapOr<U>(defaultValue: U): Promise<IsOk<R, Value<R>, Awaited<U>>> {
    return this.then((res) => res.unwrapOr(defaultValue));
  }

  unwrapOrElse<U>(fn: (error: Error<R>) => U): Promise<IsOk<R, Value<R>, Awaited<U>>> {
    return this.then((res) => res.unwrapOrElse(fn));
  }

  ok(): Promise<ReturnType<R['ok']>> {
    return this.then((res) => res.ok() as ReturnType<R['ok']>);
  }

  err(): Promise<ReturnType<R['err']>> {
    return this.then((res) => res.err() as ReturnType<R['err']>);
  }

  transpose(): Promise<ReturnType<R['transpose']>> {
    return this.then((res) => res.transpose());
  }

  flatten(): AsyncResult<
    IsOk<R, Value<R> extends AnyResult ? Value<R> : Ok<Value<R>>, Err<Error<R>>>
  > {
    return new AsyncResult(this.then((res) => res.flatten()));
  }

  map<U>(fn: (value: Value<R>) => U): AsyncResult<IsOk<R, Ok<Awaited<U>>, Err<Error<R>>>> {
    return new AsyncResult(
      this.then((res) => res.map(fn) as IsOk<R, Ok<Awaited<U>>, Err<Error<R>>>),
    );
  }

  mapErr<F>(fn: (error: Error<R>) => F): AsyncResult<IsOk<R, Ok<Value<R>>, Err<Awaited<F>>>> {
    return new AsyncResult(
      this.then((res) => res.mapErr(fn) as IsOk<R, Ok<Value<R>>, Err<Awaited<F>>>),
    );
  }

  mapOr<D, U>(
    defaultValue: D,
    fn: (value: Value<R>) => U,
  ): Promise<IsOk<R, Awaited<U>, Awaited<D>>> {
    return this.then((res) => res.mapOr(defaultValue, fn) as IsOk<R, Awaited<U>, Awaited<D>>);
  }

  mapOrElse<D, U>(
    defaultFn: (error: Error<R>) => D,
    fn: (value: Value<R>) => U,
  ): Promise<IsOk<R, Awaited<U>, Awaited<D>>> {
    return this.then((res) => res.mapOrElse(defaultFn, fn) as IsOk<R, Awaited<U>, Awaited<D>>);
  }

  and<B extends AnyResult>(resB: B): AsyncResult<IsOk<R, Awaited<B>, Err<Error<R>>>> {
    return new AsyncResult(this.then((res) => res.and(resB)));
  }

  or<B extends AnyResult>(resB: B): AsyncResult<IsOk<R, Ok<Value<R>>, Awaited<B>>> {
    return new AsyncResult(this.then((res) => res.or(resB)));
  }

  andThen<B extends AnyResult>(
    fn: (value: Value<R>) => B,
  ): AsyncResult<IsOk<R, Awaited<B>, Err<Error<R>>>> {
    return new AsyncResult(this.then((res) => res.andThen(fn)));
  }

  orElse<B extends AnyResult>(
    fn: (error: Error<R>) => B,
  ): AsyncResult<IsOk<R, Ok<Value<R>>, Awaited<B>>> {
    return new AsyncResult(this.then((res) => res.orElse(fn)));
  }

  match<U>(m: ResultMatch<Value<R>, Error<R>, U>): Promise<U> {
    return this.then((res) => res.match(m));
  }
}

export type AsyncOk<T> = AsyncResult<Ok<T>>;
export type AsyncErr<E> = AsyncResult<Err<E>>;

export function asyncOk<T>(value: T): AsyncOk<T> {
  return new AsyncResult(Promise.resolve(ok(value)));
}

export function asyncErr<E>(error: E): AsyncErr<E> {
  return new AsyncResult(Promise.resolve(err(error)));
}

export function asyncResult<T>(fn: () => Promise<T>): AsyncResult<Result<T, unknown>> {
  return new AsyncResult(
    fn()
      .then((value) => ok(value))
      .catch((error) => err(error)),
  );
}
