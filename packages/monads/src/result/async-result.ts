import { MaybePromise } from '../util';
import { AnyResult, Err, Ok, Result, err, ok } from './result';
import { ResultMatch } from './util';

type Value<R extends AnyResult> = ReturnType<R['unwrap']>;
type Error<R extends AnyResult> = ReturnType<R['unwrapErr']>;
type IsOk<R extends AnyResult, TIsOk, TIsErr> = R extends Ok<unknown> ? TIsOk : TIsErr;

export class AsyncResult<R extends AnyResult> {
  private _promise: Promise<R>;

  constructor(promise: Promise<R>) {
    this._promise = promise;
  }

  // TODO memoize Promise result?
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

  async isOkAnd<P extends MaybePromise<boolean>>(
    fn: (value: Value<R>) => P,
  ): Promise<IsOk<R, Awaited<P>, false>> {
    return this.then(async (res) => (await res.isOkAnd(fn)) as IsOk<R, Awaited<P>, false>);
  }

  async isErrAnd<P extends MaybePromise<boolean>>(
    fn: (error: Error<R>) => P,
  ): Promise<IsOk<R, false, Awaited<P>>> {
    return this.then(async (res) => (await res.isErrAnd(fn)) as IsOk<R, false, Awaited<P>>);
  }

  inspect(fn: (value: Value<R>) => void): typeof this {
    // TODO test race conditions
    this.then((res) => res.inspect(fn));
    return this;
  }

  inspectErr(fn: (error: Error<R>) => void): typeof this {
    // TODO test race conditions
    this.then((res) => res.inspectErr(fn));
    return this;
  }

  async expect(message: string): Promise<ReturnType<R['expect']>> {
    return this.then((res) => res.expect(message));
  }

  async expectErr(message: string): Promise<ReturnType<R['expectErr']>> {
    return this.then((res) => res.expectErr(message));
  }

  async unwrap(): Promise<Value<R>> {
    return this.then((res) => res.unwrap());
  }

  async unwrapErr(): Promise<Error<R>> {
    return this.then((res) => res.unwrapErr());
  }

  async unwrapOr<U>(defaultValue: U): Promise<IsOk<R, Value<R>, Awaited<U>>> {
    return this.then((res) => res.unwrapOr(defaultValue));
  }

  async unwrapOrElse<U>(fn: (error: Error<R>) => U): Promise<IsOk<R, Value<R>, Awaited<U>>> {
    return this.then((res) => res.unwrapOrElse(fn));
  }

  async ok(): Promise<ReturnType<R['ok']>> {
    return this.then((res) => res.ok() as ReturnType<R['ok']>);
  }

  async err(): Promise<ReturnType<R['err']>> {
    return this.then((res) => res.err() as ReturnType<R['err']>);
  }

  async transpose(): Promise<ReturnType<R['transpose']>> {
    return this.then((res) => res.transpose());
  }

  flatten(): AsyncResult<ReturnType<R['flatten']>> {
    return new AsyncResult(this.then((res) => res.flatten()));
  }

  map<U>(fn: (value: Value<R>) => U): AsyncResult<IsOk<R, Ok<Awaited<U>>, Err<Error<R>>>> {
    return new AsyncResult(this.then((res) => res.map(fn)));
  }

  mapErr<F>(fn: (error: Error<R>) => F): AsyncResult<IsOk<R, Ok<Value<R>>, Err<Awaited<F>>>> {
    return new AsyncResult(this.then((res) => res.mapErr(fn)));
  }

  async mapOr<U>(defaultValue: U, fn: (value: Value<R>) => U): Promise<U> {
    return this.then((res) => res.mapOr(defaultValue, fn));
  }

  async mapOrElse<U>(defaultFn: (error: Error<R>) => U, fn: (value: Value<R>) => U): Promise<U> {
    return this.then((res) => res.mapOrElse(defaultFn, fn));
  }

  and<B extends AnyResult | AnyAsyncResult>(resB: B): AsyncResult<IsOk<R, B, Err<Error<R>>>> {
    return new AsyncResult(this.then((res) => res.and(resB)));
  }

  or<B extends AnyResult | AnyAsyncResult>(resB: B): AsyncResult<IsOk<R, Ok<Value<R>>, B>> {
    return new AsyncResult(this.then((res) => res.or(resB)));
  }

  andThen<B extends AnyResult | AnyAsyncResult>(
    fn: (value: Value<R>) => B,
  ): AsyncResult<IsOk<R, B, Err<Error<R>>>> {
    return new AsyncResult(this.then((res) => res.andThen(fn)));
  }

  orElse<B extends AnyResult | AnyAsyncResult>(
    fn: (error: Error<R>) => B,
  ): AsyncResult<IsOk<R, Ok<Value<R>>, B>> {
    return new AsyncResult(this.then((res) => res.orElse(fn)));
  }

  async match<U>(m: ResultMatch<Value<R>, Error<R>, U>): Promise<U> {
    return this.then((res) => res.match(m));
  }
}

export type AsyncOk<T> = AsyncResult<Ok<T>>;
export type AsyncErr<E> = AsyncResult<Err<E>>;
export type AnyAsyncResult = AsyncResult<AnyResult>;

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
      .catch((error) => err<unknown>(error)),
  );
}
