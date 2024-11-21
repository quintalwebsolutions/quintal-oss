import type { OptionDocs } from './OptionDocs';

export class None implements OptionDocs<never, 'none'> {
  get isSome() {
    return false as const;
  }

  get isNone() {
    return true as const;
  }

  unwrap(): never {
    throw new Error('Attempted to unwrap a None value');
  }

  // TODO rest of the methods
  // isSomeAnd<TPredicate extends MaybePromise<boolean>>(_fn: (value: never) => TPredicate): false {
  //   return false;
  // }

  // inspect(_fn: (value: never) => void): None {
  //   return this;
  // }

  // expect(message: string): never {
  //   throw new Error(message);
  // }

  // unwrap(): never {
  //   throw new Error(`Attempted to unwrap a 'none' value`);
  // }

  // unwrapOr<TDefaultValue>(defaultValue: TDefaultValue): TDefaultValue {
  //   return defaultValue;
  // }

  // unwrapOrElse<TDefaultValue>(fn: () => TDefaultValue): TDefaultValue {
  //   return fn();
  // }

  // okOr<TError>(error: TError): Err<TError> {
  //   return err(error);
  // }

  // okOrElse<TError>(errorFn: () => TError): Err<TError> {
  //   return err(errorFn());
  // }

  // map<TMappedValue>(_fn: (value: never) => TMappedValue): None {
  //   return this;
  // }

  // mapOr<TDefaultValue, TMappedValue>(
  //   defaultValue: TDefaultValue,
  //   _fn: (value: never) => TMappedValue,
  // ): TDefaultValue {
  //   return defaultValue;
  // }

  // mapOrElse<TDefaultValue, TMappedValue>(
  //   defaultFn: () => TDefaultValue,
  //   _fn: (value: never) => TMappedValue,
  // ): TDefaultValue {
  //   return defaultFn();
  // }

  // filter<TPredicate extends boolean>(_predicate: (value: never) => TPredicate): None {
  //   return this;
  // }

  // and<TOptionB extends AnyOption>(_opt: TOptionB): None {
  //   return this;
  // }

  // or<TOptionB extends AnyOption>(opt: TOptionB): TOptionB {
  //   return opt;
  // }

  // xor<TOptionB extends AnyOption>(opt: TOptionB): Ternary<TOptionB['isSome'], TOptionB, None> {
  //   type Cast = Ternary<(typeof opt)['isSome'], typeof opt, None>;

  //   return (opt.isSome ? opt : none) as Cast;
  // }

  // andThen<TOption extends AnyOption>(_fn: (value: never) => TOption): None {
  //   return this;
  // }

  // orElse<TOption extends AnyOption>(fn: () => TOption): TOption {
  //   return fn();
  // }

  // match<TOutput>(m: OptionMatch<never, TOutput>): TOutput {
  //   return m.none();
  // }
}
