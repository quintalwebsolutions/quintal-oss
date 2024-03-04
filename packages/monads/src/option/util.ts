import { Option } from './option';

export type OptionMatch<T, U> = {
  some: (value: T) => U;
  none: () => U;
};

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyOption = Option<any>;
// TODO
// export type AnyOption = Option<any> | AsyncOption<any>;

export function isAnyOption<T>(opt: T | AnyOption): opt is AnyOption {
  return typeof opt === 'object' && opt !== null && 'isSome' in opt && 'isNone' in opt;
  // TODO
  // return opt instanceof Some || opt instanceof none;
}
