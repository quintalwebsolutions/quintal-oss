import { AnyResult, Err, Ok, Result, err, ok } from './result';

export class AsyncResult<R extends AnyResult> {
  protected _promise: Promise<R>;

  constructor(promise: Promise<R>) {
    this._promise = promise;
  }

  then<TResult1 = R, TResult2 = never>(
    onfulfilled?: (value: R) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): PromiseLike<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  get isOk(): Promise<R['isOk']> {
    // TODO memoize Promise result?
    return this._promise.then((res) => res.isOk);
  }

  get isErr(): Promise<R['isErr']> {
    return this._promise.then((res) => res.isErr);
  }
}

export class AsyncOk<T> extends AsyncResult<Ok<T>> {
  get value(): Promise<T> {
    return this._promise.then((res) => res.unwrap());
  }
}

export class AsyncErr<E> extends AsyncResult<Err<E>> {
  get error(): Promise<E> {
    return this._promise.then((res) => res.unwrap());
  }
}

export function asyncOk<T>(value: T): AsyncOk<T> {
  return new AsyncOk(Promise.resolve(ok(value)));
}

export function asyncErr<E>(error: E): AsyncErr<E> {
  return new AsyncErr(Promise.resolve(err(error)));
}

export function asyncResult<T>(fn: () => Promise<T>): AsyncResult<Result<T, unknown>> {
  return new AsyncResult(
    fn()
      .then((value) => ok(value))
      .catch((error) => err<unknown>(error)),
  );
}
