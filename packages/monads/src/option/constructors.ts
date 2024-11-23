import { AsyncOption } from './AsyncOption';
import { None } from './None';
import { Some } from './Some';
import type { AsyncSome } from './types';

type InferredOptionValue = string | number | boolean;

export function some<TValue extends InferredOptionValue>(value: TValue): Some<TValue>;
export function some<TValue>(value: TValue): Some<TValue>;
export function some<TValue>(value: TValue): Some<TValue> {
  return new Some(value);
}

export const none = new None();

export function asyncSome<TValue extends InferredOptionValue>(value: TValue): AsyncSome<TValue>;
export function asyncSome<TValue>(value: TValue): AsyncSome<TValue>;
export function asyncSome<TValue>(value: TValue): AsyncSome<TValue> {
  return new AsyncOption(Promise.resolve(some(value)));
}

export const asyncNone = new AsyncOption(Promise.resolve(none));
