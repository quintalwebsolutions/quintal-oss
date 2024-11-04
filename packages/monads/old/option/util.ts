import type { Option } from './option';

export type OptionMatch<TValue, TOutput> = {
  some: (value: TValue) => TOutput;
  none: () => TOutput;
};

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyOption = Option<any>;
// TODO
// export type AnyOption = Option<any> | AsyncOption<any>;

export function isAnyOption<TOption>(opt: TOption | AnyOption): opt is AnyOption {
  return typeof opt === 'object' && opt !== null && 'isSome' in opt && 'isNone' in opt;
  // TODO
  // return opt instanceof Some || opt instanceof none;
}
