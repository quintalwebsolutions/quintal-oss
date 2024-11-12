import type { OptionDocs } from './OptionDocs';

export class Some<TValue> implements OptionDocs<TValue, 'some'> {
  protected _value: TValue;

  constructor(value: TValue) {
    this._value = value;
  }

  get value(): TValue {
    return this._value;
  }

  get isSome() {
    return true as const;
  }

  get isNone() {
    return false as const;
  }

  unwrap() {
    return this._value;
  }
}
