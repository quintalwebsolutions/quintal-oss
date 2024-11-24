import type { OptionDocs } from './OptionDocs.ts';

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

  // TODO rest of the methods
  // isSomeAnd<TPredicate extends MaybePromise<boolean>>(
  //   fn: (value: TValue) => TPredicate,
  // ): TPredicate {
  //   return fn(this.value);
  // }

  // inspect(fn: (value: TValue) => void): Some<TValue> {
  //   fn(this.value);
  //   return this;
  // }

  // expect(_message: string): TValue {
  //   return this.value;
  // }

  // unwrap(): TValue {
  //   return this.value;
  // }

  // unwrapOr<TDefaultValue>(_defaultValue: TDefaultValue): TValue {
  //   return this.value;
  // }

  // unwrapOrElse<TDefaultValue>(_fn: () => TDefaultValue): TValue {
  //   return this.value;
  // }

  // okOr<TError>(_error: TError): Ok<TValue> {
  //   return ok(this.value);
  // }

  // okOrElse<TError>(_errorFn: () => TError): Ok<TValue> {
  //   return ok(this.value);
  // }

  // map<TMappedValue>(fn: (value: TValue) => TMappedValue): Some<TMappedValue> {
  //   return some(fn(this.value));
  // }

  // mapOr<TDefaultValue, TMappedValue>(
  //   _defaultValue: TDefaultValue,
  //   fn: (value: TValue) => TMappedValue,
  // ): TMappedValue {
  //   return fn(this.value);
  // }

  // mapOrElse<TDefaultValue, TMappedValue>(
  //   _defaultFn: () => TDefaultValue,
  //   fn: (value: TValue) => TMappedValue,
  // ): TMappedValue {
  //   return fn(this.value);
  // }

  // filter<TPredicate extends boolean>(
  //   predicate: (value: TValue) => TPredicate,
  // ): TPredicate extends true ? Some<TValue> : None {
  //   type Cast = ReturnType<typeof predicate> extends true ? Some<TValue> : None;

  //   return (predicate(this.value) ? this : none) as Cast;
  // }

  // and<TOptionB extends AnyOption>(opt: TOptionB): TOptionB {
  //   return opt;
  // }

  // or<TOptionB extends AnyOption>(_opt: TOptionB): Some<TValue> {
  //   return this;
  // }

  // xor<TOptionB extends AnyOption>(opt: TOptionB): Ternary<TOptionB['isSome'], None, Some<TValue>> {
  //   type Cast = Ternary<(typeof opt)['isSome'], None, Some<TValue>>;

  //   return (opt.isSome ? none : this) as Cast;
  // }

  // andThen<TOptionB extends AnyOption>(fn: (value: TValue) => TOptionB): TOptionB {
  //   return fn(this.value);
  // }

  // orElse<TOptionB extends AnyOption>(_fn: () => TOptionB): Some<TValue> {
  //   return this;
  // }

  // match<TOutput>(m: OptionMatch<TValue, TOutput>): TOutput {
  //   return m.some(this.value);
  // }
}
