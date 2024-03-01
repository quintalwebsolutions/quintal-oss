import { AnyOption } from './option';

export type OptionMatch<T, U> = {
  some: (value: T) => U;
  none: () => U;
};

export function isAnyOption<T>(opt: T | AnyOption): opt is AnyOption {
  return typeof opt === 'object' && opt !== null && 'isSome' in opt && 'isNone' in opt;
  // TODO
  // return opt instanceof Some || opt instanceof none;
}
