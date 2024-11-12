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
}
