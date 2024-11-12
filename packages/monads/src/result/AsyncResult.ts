import { type AnySyncOption, type AsyncNone, AsyncOption, type AsyncSome } from '../option';
import type { ResultDocs } from './ResultDocs';
import type {
  AnySyncResult,
  AsyncErr,
  AsyncOk,
  MaybePromise,
  ResultMatch,
  ResultTernary,
  SerializedErr,
  SerializedOk,
  ValueFromErr,
  ValueFromOk,
} from './types';

export class AsyncResult<TResult extends AnySyncResult> implements ResultDocs<TResult, 'async'> {
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

  get isOk() {
    type Return = ResultTernary<TResult, true, false>;
    return this.then((res) => res.isOk as Return);
  }

  get isErr() {
    type Return = ResultTernary<TResult, false, true>;
    return this.then((res) => res.isErr as Return);
  }

  isOkAnd<TPredicate extends MaybePromise<boolean>>(
    fn: (value: ValueFromOk<TResult>) => TPredicate,
  ) {
    type Return = ResultTernary<TResult, Awaited<TPredicate>, false>;
    return this.then(async (res) => (await res.isOkAnd(fn)) as Return);
  }

  isErrAnd<TPredicate extends MaybePromise<boolean>>(
    fn: (error: ValueFromErr<TResult>) => TPredicate,
  ) {
    type Return = ResultTernary<TResult, false, Awaited<TPredicate>>;
    return this.then(async (res) => (await res.isErrAnd(fn)) as Return);
  }

  inspect(fn: (value: ValueFromOk<TResult>) => MaybePromise<void>) {
    this.then((res) => res.inspect(fn));
    return this;
  }

  inspectErr(fn: (error: ValueFromErr<TResult>) => MaybePromise<void>) {
    this.then((res) => res.inspectErr(fn));
    return this;
  }

  expect(message: string) {
    type Return = ValueFromOk<TResult>;
    return this.then((res) => res.expect(message) as Return);
  }

  expectErr(message: string) {
    type Return = ValueFromErr<TResult>;
    return this.then((res) => res.expectErr(message) as Return);
  }

  unwrap() {
    type Return = ValueFromOk<TResult>;
    return this.then((res) => res.unwrap() as Return);
  }

  unwrapErr() {
    type Return = ValueFromErr<TResult>;
    return this.then((res) => res.unwrapErr() as Return);
  }

  unwrapOr<TDefaultValue>(defaultValue: TDefaultValue) {
    type Return = ResultTernary<TResult, ValueFromOk<TResult>, Awaited<TDefaultValue>>;
    return this.then(async (res) => (await res.unwrapOr(defaultValue)) as Return);
  }

  unwrapOrElse<TDefaultValue>(fn: (error: ValueFromErr<TResult>) => TDefaultValue) {
    type Return = ResultTernary<TResult, ValueFromOk<TResult>, Awaited<TDefaultValue>>;
    return this.then(async (res) => (await res.unwrapOrElse(fn)) as Return);
  }

  ok() {
    type Return = ResultTernary<TResult, AsyncSome<TResult>, AsyncNone>;
    const promise = this.then((res) => res.ok() as AnySyncOption);
    return new AsyncOption(promise) as Return;
  }

  err() {
    type Return = ResultTernary<TResult, AsyncNone, AsyncSome<TResult>>;
    const promise = this.then((res) => res.err() as AnySyncOption);
    return new AsyncOption(promise) as Return;
  }

  // TODO transpose
  // transpose(): Promise<ReturnType<TResult['transpose']>> {
  //   return this.then((res) => res.transpose());
  // }

  // TODO flatten
  // flatten(): AsyncResult<
  //   IsOk<
  //     TResult,
  //     Value<TResult> extends AnyResult ? Value<TResult> : Ok<Value<TResult>>,
  //     Err<Error<TResult>>
  //   >
  // > {
  //   return new AsyncResult(this.then((res) => res.flatten()));
  // }

  map<TMappedValue>(fn: (value: ValueFromOk<TResult>) => TMappedValue) {
    type Return = ResultTernary<
      TResult,
      AsyncOk<Awaited<TMappedValue>>,
      AsyncErr<ValueFromErr<TResult>>
    >;
    const promise = this.then(async (res) => (await res.map(fn)) as AnySyncResult);
    return new AsyncResult(promise) as Return;
  }

  mapErr<TMappedError>(fn: (error: ValueFromErr<TResult>) => TMappedError) {
    type Return = ResultTernary<
      TResult,
      AsyncOk<ValueFromOk<TResult>>,
      AsyncErr<Awaited<TMappedError>>
    >;
    const promise = this.then(async (res) => (await res.mapErr(fn)) as AnySyncResult);
    return new AsyncResult(promise) as Return;
  }

  mapOr<TDefaultValue, TMappedValue>(
    defaultValue: TDefaultValue,
    fn: (value: ValueFromOk<TResult>) => TMappedValue,
  ) {
    type Return = Promise<Awaited<ResultTernary<TResult, TMappedValue, TDefaultValue>>>;
    return this.then(async (res) => await res.mapOr(defaultValue, fn)) as Return;
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    defaultFn: (error: ValueFromErr<TResult>) => TDefaultValue,
    fn: (value: ValueFromOk<TResult>) => TMappedValue,
  ) {
    type Return = Promise<Awaited<ResultTernary<TResult, TMappedValue, TDefaultValue>>>;
    return this.then(async (res) => await res.mapOrElse(defaultFn, fn)) as Return;
  }

  // and<TResultB extends AnyResult>(
  //   resB: TResultB,
  // ): AsyncResult<IsOk<TResult, Awaited<TResultB>, Err<Error<TResult>>>> {
  //   return new AsyncResult(this.then((res) => res.and(resB)));
  // }

  // or<TResultB extends AnyResult>(
  //   resB: TResultB,
  // ): AsyncResult<IsOk<TResult, Ok<Value<TResult>>, Awaited<TResultB>>> {
  //   return new AsyncResult(this.then((res) => res.or(resB)));
  // }

  // andThen<TResultB extends AnyResult>(
  //   fn: (value: Value<TResult>) => TResultB,
  // ): AsyncResult<IsOk<TResult, Awaited<TResultB>, Err<Error<TResult>>>> {
  //   return new AsyncResult(this.then((res) => res.andThen(fn)));
  // }

  // orElse<TResultB extends AnyResult>(
  //   fn: (error: Error<TResult>) => TResultB,
  // ): AsyncResult<IsOk<TResult, Ok<Value<TResult>>, Awaited<TResultB>>> {
  //   return new AsyncResult(this.then((res) => res.orElse(fn)));
  // }

  match<TOutputOk, TOutputErr>(
    match: ResultMatch<ValueFromOk<TResult>, ValueFromErr<TResult>, TOutputOk, TOutputErr>,
  ) {
    type Return = ResultTernary<TResult, TOutputOk, TOutputErr>;
    return this.then((res) => res.match(match) as Return);
  }

  serialize() {
    type Return = ResultTernary<
      TResult,
      SerializedOk<ValueFromOk<TResult>>,
      SerializedErr<ValueFromErr<TResult>>
    >;
    return this.then((res) => res.serialize() as Return);
  }
}
