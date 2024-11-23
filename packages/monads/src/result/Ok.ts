import {
  type AnySyncOption,
  type AsyncNone,
  AsyncOption,
  type AsyncSome,
  type None,
  type Some,
  isAnyAsyncOption,
  isAnyResult,
  isAnySyncOption,
  none,
  some,
} from '..';
import type { MaybePromise } from '../util';
import { AsyncResult } from './AsyncResult';
import type { ResultDocs } from './ResultDocs';
import { ok } from './constructors';
import type { AnyResult, AnySyncResult, AsyncOk, ResultMatch, SerializedOk } from './types';

export class Ok<TValue> implements ResultDocs<TValue, 'ok'> {
  private _value: TValue;

  constructor(value: TValue) {
    this._value = value;
  }

  get value() {
    return this._value;
  }

  get isOk() {
    return true as const;
  }

  get isErr() {
    return false as const;
  }

  isOkAnd<TPredicate extends MaybePromise<boolean>>(fn: (value: TValue) => TPredicate) {
    return fn(this.value);
  }

  isErrAnd<TPredicate extends MaybePromise<boolean>>(_fn: (error: never) => TPredicate) {
    return false as const;
  }

  inspect(fn: (value: TValue) => MaybePromise<void>) {
    fn(this.value);
    return this;
  }

  inspectErr(_fn: (error: never) => MaybePromise<void>) {
    return this;
  }

  expect(_message: string) {
    return this.value;
  }

  expectErr(message: string): never {
    throw new Error(message);
  }

  unwrap() {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error(`Attempted to unwrapErr an Ok value: ${this.value}`);
  }

  unwrapOr<TDefaultValue>(_defaultValue: TDefaultValue) {
    return this.value;
  }

  unwrapOrElse<TDefaultValue>(_fn: (error: never) => TDefaultValue) {
    return this.value;
  }

  ok() {
    return some(this.value);
  }

  err() {
    return none;
  }

  transpose() {
    type Return = TValue extends None | AsyncNone
      ? TValue
      : TValue extends Some<infer TSome>
        ? Some<Ok<TSome>>
        : TValue extends AsyncSome<infer TSome>
          ? AsyncSome<Ok<TSome>>
          : Some<Ok<TValue>>;
    const _transpose = (option: AnySyncOption) => (option.isNone ? option : some(ok(option.value)));
    if (isAnySyncOption(this.value)) return _transpose(this.value) as Return;
    if (isAnyAsyncOption(this.value)) return new AsyncOption(this.value.then(_transpose)) as Return;
    return some(ok(this.value)) as Return;
  }

  flatten() {
    type Return = TValue extends AnyResult ? TValue : Ok<TValue>;
    return (isAnyResult(this.value) ? this.value : this) as Return;
  }

  map<TMappedValue>(fn: (value: TValue) => TMappedValue) {
    type Return = TMappedValue extends Promise<infer TAwaitedMappedValue>
      ? AsyncOk<TAwaitedMappedValue>
      : Ok<TMappedValue>;
    const mappedValue = fn(this.value);
    if (mappedValue instanceof Promise) return new AsyncResult(mappedValue.then(ok)) as Return;
    return ok(mappedValue) as Return;
  }

  mapErr<TMappedError>(_fn: (error: never) => TMappedError) {
    return this;
  }

  mapOr<TDefaultValue, TMappedValue>(
    _defaultValue: TDefaultValue,
    fn: (value: TValue) => TMappedValue,
  ) {
    return fn(this.value);
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    _defaultFn: (error: never) => TDefaultValue,
    fn: (value: TValue) => TMappedValue,
  ) {
    return fn(this.value);
  }

  and<TResultB extends AnyResult | Promise<AnySyncResult>>(resultB: TResultB) {
    type Return = TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
      ? AsyncResult<TInternalResultB>
      : TResultB;
    if (resultB instanceof Promise) return new AsyncResult(resultB) as Return;
    return resultB as Return;
  }

  or<TResultB extends AnyResult | Promise<AnySyncResult>>(_resultB: TResultB) {
    return this;
  }

  andThen<TResultB extends AnyResult | Promise<AnySyncResult>>(fn: (value: TValue) => TResultB) {
    type Return = TResultB extends Promise<infer TInternalResultB extends AnySyncResult>
      ? AsyncResult<TInternalResultB>
      : TResultB;
    const result = fn(this.value);
    if (result instanceof Promise) return new AsyncResult(result) as Return;
    return result as Return;
  }

  orElse<TResultB extends AnyResult | Promise<AnySyncResult>>(_fn: (error: never) => TResultB) {
    return this;
  }

  match<TOutputOk, TOutputErr>(match: ResultMatch<TValue, never, TOutputOk, TOutputErr>) {
    return match.ok(this.value);
  }

  serialize() {
    return { type: 'ok', value: this.value } satisfies SerializedOk<TValue>;
  }
}
