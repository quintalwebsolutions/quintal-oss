import { AsyncResultConstructor } from './async-result-constructor';

export class AsyncOk<T> implements AsyncResultConstructor<true, T, never> {}

export class AsyncErr<E> implements AsyncResultConstructor<false, never, E> {}

export type AsyncResult<T, E> = AsyncOk<T> | AsyncErr<E>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyAsyncResult = AsyncResult<any, any>;

export function asyncOk<T>(value: T): AsyncOk<T> {
  return new AsyncOk(value);
}

export function asyncErr<E>(error: E): AsyncErr<E> {
  return new AsyncErr(error);
}

export function asyncResult<T>(fn: () => T);
