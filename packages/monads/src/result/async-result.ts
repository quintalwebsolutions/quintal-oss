import { Result, err, ok } from './result';

// TODO proof of concept
// type AsyncOkConstructor<T> = PromiseLike<Ok<T>> & ResultConstructor<true, T, never>;
// export class AsyncOk<T> implements AsyncOkConstructor<T> {
//   private _promise: Promise<Ok<T>>;

//   constructor(promise: Promise<Ok<T>>) {
//     this._promise = promise;
//   }

//   then<TResult1 = Ok<T>, TResult2 = never>(
//     onfulfilled?: (value: Ok<T>) => TResult1 | PromiseLike<TResult1>,
//     onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
//   ): PromiseLike<TResult1 | TResult2> {
//     return this._promise.then(onfulfilled, onrejected);
//   }
// }

// type AsyncErrConstructor<E> = PromiseLike<Err<E>> & ResultConstructor<false, never, E>;
// export class AsyncErr<E> implements AsyncErrConstructor<E> {
//   private _promise: Promise<Err<E>>;

//   constructor(promise: Promise<Err<E>>) {
//     this._promise = promise;
//   }

//   then<TResult1 = Err<E>, TResult2 = never>(
//     onfulfilled?: (value: Err<E>) => TResult1 | PromiseLike<TResult1>,
//     onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
//   ): PromiseLike<TResult1 | TResult2> {
//     return this._promise.then(onfulfilled, onrejected);
//   }
// }

// export type AsyncResult<T, E> = AsyncOk<T> | AsyncErr<E>;

// // biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
// export type AnyAsyncResult = AsyncResult<any, any>;

// export function asyncOk<T>(value: T): AsyncOk<T> {
//   return new AsyncOk(Promise.resolve(ok(value)));
// }

// export function asyncErr<E>(error: E): AsyncErr<E> {
//   return new AsyncErr(Promise.resolve(err(error)));
// }

export async function asyncResult<T>(fn: () => Promise<T>): Promise<Result<T, unknown>> {
  try {
    const value = await fn();
    return ok(value);
  } catch (e) {
    return err(e);
  }
}
