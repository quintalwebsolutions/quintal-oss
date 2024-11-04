import { none, some } from '../../old/option';
import { AsyncResult } from './AsyncResult';
import type { ResultDocs } from './ResultDocs';
import { ok } from './constructors';
import type { AnyResult, AsyncOk, MaybePromise, ResultMatch, SerializedOk } from './types';

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
    throw new Error(`Attempted to unwrapErr an 'ok' value: ${this.value}`);
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

  // TODO transpose
  // transpose(): TValue extends None
  //   ? TValue
  //   : Some<Ok<TValue extends Some<infer TSome> ? TSome : TValue>> {
  //   // TODO achieve without cast?
  //   type Cast = TValue extends None
  //     ? TValue
  //     : Some<Ok<TValue extends Some<infer TSome> ? TSome : TValue>>;

  //   const v = this.value;
  //   const isOption = isAnyOption(v);
  //   if (isOption && v.isNone) return v as Cast;
  //   return some(ok(isOption && v.isSome ? v.unwrap() : v)) as Cast;
  // }

  // TODO flatten
  // flatten(): TValue extends AnyResult ? TValue : Ok<TValue> {
  //   // TODO achieve without cast?
  //   type Cast = TValue extends AnyResult ? TValue : Ok<TValue>;

  //   const v = this.value;
  //   if (isAnyResult(v)) return v as Cast;
  //   return ok(v) as Cast;
  // }

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

  and<TResultB extends AnyResult>(resultB: TResultB) {
    return resultB;
  }

  or<TResultB extends AnyResult>(_resultB: TResultB) {
    return this;
  }

  andThen<TResultB extends AnyResult>(fn: (value: TValue) => TResultB) {
    return fn(this.value);
  }

  orElse<TResultB extends AnyResult>(_fn: (error: never) => TResultB) {
    return this;
  }

  match<TOutputOk, TOutputErr>(match: ResultMatch<TValue, never, TOutputOk, TOutputErr>) {
    return match.ok(this.value);
  }

  serialize() {
    return { type: 'ok', value: this.value } satisfies SerializedOk<TValue>;
  }

  // TODO merge
  // merge<TResultB extends AnyResult>(
  //   resultB: TResultB,
  // ): TResultB extends Ok<infer TValueB> ? Ok<[TValue, TValueB]> : TResultB {
  //   // TODO achieve without cast?
  //   type Cast = TResultB extends Ok<infer TValueB> ? Ok<[TValue, TValueB]> : TResultB;

  //   if (resultB.isErr) return resultB as Cast;
  //   return ok([this._value, resultB.value]) as Cast;
  // }

  // merge<TResultB extends AnyResult>(
  //   resultB: TResultB,
  // ) {
  //   if (resultB.isErr) return resultB;
  //   return ok([this._value, resultB.value]);
  // }
}
