import {
  type AnyOption,
  type AnySyncOption,
  type AsyncNone,
  AsyncOption,
  type AsyncSome,
  type None,
  type Some,
  isAnyOption,
  some,
} from '../option/index.ts';
import type { MaybePromise } from '../util.ts';
import type { Err } from './Err.ts';
import type { Ok } from './Ok.ts';
import type { ResultDocs } from './ResultDocs.ts';
import { ok } from './constructors.ts';
import type {
  AnyResult,
  AnySyncResult,
  AsyncErr,
  AsyncOk,
  ResultMatch,
  ResultTernary,
  SerializedErr,
  SerializedOk,
  ValueFromErr,
  ValueFromOk,
} from './types.ts';

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
    type Return = ResultTernary<TResult, AsyncSome<ValueFromOk<TResult>>, AsyncNone>;
    const promise = this.then((res) => res.ok() as AnySyncOption);
    return new AsyncOption(promise) as Return;
  }

  err() {
    type Return = ResultTernary<TResult, AsyncNone, AsyncSome<ValueFromErr<TResult>>>;
    const promise = this.then((res) => res.err() as AnySyncOption);
    return new AsyncOption(promise) as Return;
  }

  transpose() {
    type Return = ResultTernary<
      TResult,
      TResult extends Ok<infer TOption extends AnyOption>
        ? TOption extends None | AsyncNone
          ? AsyncNone
          : TOption extends Some<infer TSome>
            ? AsyncSome<Ok<TSome>>
            : TOption extends AsyncSome<infer TSome>
              ? AsyncSome<Ok<TSome>>
              : never
        : AsyncSome<Ok<ValueFromOk<TResult>>>,
      AsyncSome<TResult>
    >;
    return new AsyncOption(
      this.then(async (res) => {
        if (res.isOk && isAnyOption(res.value)) {
          const option = await res.value;
          if (option.isNone) return option;
          return some(ok(option.value));
        }

        return some(res);
      }),
    ) as Return;
  }

  flatten() {
    type Return = ResultTernary<
      TResult,
      ValueFromOk<TResult> extends AnySyncResult
        ? AsyncResult<ValueFromOk<TResult>>
        : ValueFromOk<TResult> extends AnyResult
          ? ValueFromOk<TResult>
          : AsyncResult<Ok<ValueFromOk<TResult>>>,
      AsyncResult<Err<ValueFromErr<TResult>>>
    >;
    return new AsyncResult(this.then((res) => res.flatten())) as Return;
  }

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
  ): Promise<Awaited<ResultTernary<TResult, TMappedValue, TDefaultValue>>> {
    type Return = Promise<Awaited<ResultTernary<TResult, TMappedValue, TDefaultValue>>>;
    return this.then(async (res) => await res.mapOr(defaultValue, fn)) as Return;
  }

  mapOrElse<TDefaultValue, TMappedValue>(
    defaultFn: (error: ValueFromErr<TResult>) => TDefaultValue,
    fn: (value: ValueFromOk<TResult>) => TMappedValue,
  ): Promise<Awaited<ResultTernary<TResult, TMappedValue, TDefaultValue>>> {
    type Return = Promise<Awaited<ResultTernary<TResult, TMappedValue, TDefaultValue>>>;
    return this.then(async (res) => await res.mapOrElse(defaultFn, fn)) as Return;
  }

  and<TResultB extends AnyResult | Promise<AnySyncResult>>(
    resultB: TResultB,
  ): AsyncResult<ResultTernary<TResult, Awaited<TResultB>, Err<ValueFromErr<TResult>>>> {
    type Return = AsyncResult<
      ResultTernary<TResult, Awaited<TResultB>, Err<ValueFromErr<TResult>>>
    >;
    return new AsyncResult(this.then((res) => res.and(resultB))) as Return;
  }

  or<TResultB extends AnyResult | Promise<AnySyncResult>>(
    resultB: TResultB,
  ): AsyncResult<ResultTernary<TResult, Ok<ValueFromOk<TResult>>, Awaited<TResultB>>> {
    type Return = AsyncResult<ResultTernary<TResult, Ok<ValueFromOk<TResult>>, Awaited<TResultB>>>;
    return new AsyncResult(this.then((res) => res.or(resultB))) as Return;
  }

  andThen<TResultB extends AnyResult | Promise<AnySyncResult>>(
    fn: (value: ValueFromOk<TResult>) => TResultB,
  ): AsyncResult<ResultTernary<TResult, Awaited<TResultB>, Err<ValueFromErr<TResult>>>> {
    type Return = AsyncResult<
      ResultTernary<TResult, Awaited<TResultB>, Err<ValueFromErr<TResult>>>
    >;
    return new AsyncResult(this.then((res) => res.andThen(fn))) as Return;
  }

  orElse<TResultB extends AnyResult | Promise<AnySyncResult>>(
    fn: (error: ValueFromErr<TResult>) => TResultB,
  ): AsyncResult<ResultTernary<TResult, Ok<ValueFromOk<TResult>>, Awaited<TResultB>>> {
    type Return = AsyncResult<ResultTernary<TResult, Ok<ValueFromOk<TResult>>, Awaited<TResultB>>>;
    return new AsyncResult(this.then((res) => res.orElse(fn))) as Return;
  }

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
