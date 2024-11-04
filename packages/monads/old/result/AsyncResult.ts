import type { ResultDocs } from './ResultDocs';
import type { Err, Ok } from './result';
import type { AnyResult, ResultMatch, SerializedErr, SerializedOk } from './util';

export class AsyncResult<TResult extends AnyResult> implements ResultDocs<TResult, 'ASYNC'> {
  and<TResultB extends AnyResult>(
    resB: TResultB,
  ): AsyncResult<IsOk<TResult, Awaited<TResultB>, Err<Error<TResult>>>> {
    return new AsyncResult(this.then((res) => res.and(resB)));
  }

  or<TResultB extends AnyResult>(
    resB: TResultB,
  ): AsyncResult<IsOk<TResult, Ok<Value<TResult>>, Awaited<TResultB>>> {
    return new AsyncResult(this.then((res) => res.or(resB)));
  }

  andThen<TResultB extends AnyResult>(
    fn: (value: Value<TResult>) => TResultB,
  ): AsyncResult<IsOk<TResult, Awaited<TResultB>, Err<Error<TResult>>>> {
    return new AsyncResult(this.then((res) => res.andThen(fn)));
  }

  orElse<TResultB extends AnyResult>(
    fn: (error: Error<TResult>) => TResultB,
  ): AsyncResult<IsOk<TResult, Ok<Value<TResult>>, Awaited<TResultB>>> {
    return new AsyncResult(this.then((res) => res.orElse(fn)));
  }

  match<TOutputOk, TOutputErr>(
    m: ResultMatch<Value<TResult>, Error<TResult>, TOutputOk, TOutputErr>,
  ): Promise<IsOk<TResult, TOutputOk, TOutputErr>> {
    return this.then((res) => res.match(m) as IsOk<TResult, TOutputOk, TOutputErr>);
  }

  serialize(): Promise<IsOk<TResult, SerializedOk<Value<TResult>>, SerializedErr<Error<TResult>>>> {
    return this.then(
      (res) =>
        res.serialize() as IsOk<
          TResult,
          SerializedOk<Value<TResult>>,
          SerializedErr<Error<TResult>>
        >,
    );
  }
}
