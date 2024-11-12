import type { OptionDocs } from './OptionDocs';
import type { AnySyncOption, OptionTernary, ValueFromSome } from './types';

export class AsyncOption<TOption extends AnySyncOption> implements OptionDocs<TOption, 'async'> {
  protected _promise: Promise<TOption>;

  constructor(promise: Promise<TOption>) {
    this._promise = promise;
  }

  // biome-ignore lint/suspicious/noThenProperty: We explicitly want to make this class thenable
  then<TResult1 = TOption, TResult2 = never>(
    onfulfilled?: (value: TOption) => TResult1 | PromiseLike<TResult1>,
    onrejected?: (reason: unknown) => TResult2 | PromiseLike<TResult2>,
  ): Promise<TResult1 | TResult2> {
    return this._promise.then(onfulfilled, onrejected);
  }

  get isSome() {
    type Return = OptionTernary<TOption, true, false>;
    return this.then((opt) => opt.isSome as Return);
  }

  get isNone() {
    type Return = OptionTernary<TOption, false, true>;
    return this.then((opt) => opt.isNone as Return);
  }

  unwrap() {
    type Return = ValueFromSome<TOption>;
    return this.then((opt) => opt.unwrap() as Return);
  }
}
