import { AsyncOption } from './AsyncOption';
import { None } from './None';
import { Some } from './Some';

export type Option<TValue> = Some<TValue> | None;
export type AsyncSome<TValue> = AsyncOption<Some<TValue>>;
export type AsyncNone = AsyncOption<None>;

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnySome = Some<any>;
// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnyAsyncSome = AsyncSome<any>;

export type AnySyncOption = AnySome | None;
export type AnyAsyncOption = AsyncOption<AnySyncOption>;
export type AnyOption = AnySyncOption | AnyAsyncOption;

export function isAnySyncOption<TOption>(opt: TOption | AnySyncOption): opt is AnySyncOption {
  return opt instanceof Some || opt instanceof None;
}

export function isAnyAsyncOption<TOption>(opt: TOption | AnyAsyncOption): opt is AnyAsyncOption {
  return opt instanceof AsyncOption;
}

export function isAnyOption<TOption>(opt: TOption | AnyOption): opt is AnyOption {
  return isAnySyncOption(opt) || isAnyAsyncOption(opt);
}

export type SerializedSome<TValue> = {
  type: 'some';
  value: TValue;
};

export type SerializedNone = {
  type: 'none';
};

export type SerializedOption<TValue> = SerializedSome<TValue> | SerializedNone;

// biome-ignore lint/suspicious/noExplicitAny: This type exists solely for generic parameters to extend
export type AnySerializedOption = SerializedOption<any>;

export type OptionFromSerialized<TSerializedOption extends AnySerializedOption> =
  TSerializedOption extends SerializedSome<infer TValue>
    ? Some<TValue>
    : TSerializedOption extends None
      ? None
      : never;

export type OptionTernary<TOption, TIfSome, TIfNone> = TOption extends AnySome ? TIfSome : TIfNone;

export type ValueFromSome<TSome> = TSome extends Some<infer TValue> ? TValue : never;

export type OptionMatch<TValue, TOutputSome, TOutputNone> = {
  some: (value: TValue) => TOutputSome;
  none: () => TOutputNone;
};

export type MaybePromise<TValue> = TValue | Promise<TValue>;
