import type { MaybePromise } from './util';
import type { Validation } from './validation';
import type { AnyValue, Value, Values } from './values';

type PluginArgs = {
  /** Optional: What the internal value serializes to. Default: `TInternalValue` */
  serializedValue?: unknown;
  /** Optional: How a empty internal value should be represented. Default: `null` */
  emptyValue?: unknown;
  /** Option: What validation options should the plugin expose. Default: `Record<string, unknown>` */
  validation?: Record<string, unknown>;
};

/** Utility type to define a custom plugin value */
export type Plugin<
  TInternalValue,
  TPluginArgs extends PluginArgs = Record<string, unknown>,
> = {
  internalValue: TInternalValue;
  serializedValue: 'serializedValue' extends keyof TPluginArgs
    ? string extends keyof TPluginArgs
      ? TInternalValue
      : TPluginArgs['serializedValue']
    : TInternalValue;
  emptyValue: 'emptyValue' extends keyof TPluginArgs
    ? string extends keyof TPluginArgs
      ? null
      : TPluginArgs['emptyValue']
    : null;
  validation: 'validation' extends keyof TPluginArgs
    ? string extends keyof TPluginArgs
      ? Record<string, unknown>
      : TPluginArgs['validation']
    : Record<string, unknown>;
};

export type AnyPlugin = {
  internalValue: unknown;
  serializedValue: unknown;
  emptyValue: unknown;
  validation: Record<string, unknown>;
};

/** Utility type used to define a custom field plugin */
export type PluginObject<TPlugin extends AnyPlugin> =
  (null extends TPlugin['emptyValue']
    ? {
        /** Optional (default: `null`), define the default initial value for this field, unless otherwise specified by the hook user */
        emptyValue?: TPlugin['emptyValue'];
      }
    : {
        /** Define the default initial value for this field, unless otherwise specified by the hook user */
        emptyValue: TPlugin['emptyValue'];
      }) &
    (TPlugin['serializedValue'] extends
      | TPlugin['internalValue']
      | TPlugin['emptyValue']
      ? {
          /** Optional (default: `(value) => value`), define how to parse a single raw value to an internal value */
          parse?: (
            value: TPlugin['serializedValue'],
          ) => TPlugin['internalValue'] | TPlugin['emptyValue'];
        }
      : {
          /** Define how to parse a single raw value to an internal value */
          parse: (
            value: TPlugin['serializedValue'],
          ) => TPlugin['internalValue'] | TPlugin['emptyValue'];
        }) &
    (
      | TPlugin['internalValue']
      | TPlugin['emptyValue'] extends TPlugin['serializedValue']
      ? {
          /** Optional (default: `(value) => value`), define how to display a single internal value in the raw input */
          serialize?: (
            value: TPlugin['internalValue'] | TPlugin['emptyValue'],
          ) => TPlugin['serializedValue'];
        }
      : {
          /** Define how to display a single internal value in the raw input */
          serialize: (
            value: TPlugin['internalValue'] | TPlugin['emptyValue'],
          ) => TPlugin['serializedValue'];
        }) & {
      /** Optional (default: `() => []`), define how to validate an internal value. The array of strings returned are the error messages shown. */
      validate?: (
        value: TPlugin['internalValue'] | TPlugin['emptyValue'],
        validation: Validation<TPlugin, Values>,
      ) => MaybePromise<string[]>;
    };

export type ValueFromPlugin<TPlugin extends AnyPlugin> = Value<
  TPlugin['internalValue'],
  { serialized: TPlugin['serializedValue']; empty: TPlugin['emptyValue'] }
>;

// FIXME for some reason, this doesn't work infer the generic type argument correctly.
// The fix below works but is not ideal due to code duplication
// export type PluginFromValue<TValue extends AnyValue> = Plugin<
//   TValue['__internal__'],
//   { serializedValue: TValue['__serialized__']; emptyValue: TValue['__empty__'] }
// >;
export type PluginFromValue<TValue extends AnyValue> = {
  internalValue: TValue['__internal__'];
  serializedValue: TValue['__serialized__'];
  emptyValue: TValue['__empty__'];
  validation: Record<string, unknown>;
};

type PluginOptions<
  TPlugin extends AnyPlugin,
  TValues extends Values,
  TMany extends boolean,
> = {
  label?: string;
  description?: string;
  initialValue?: TMany extends true
    ? (TPlugin['internalValue'] | TPlugin['emptyValue'])[]
    : TPlugin['internalValue'] | TPlugin['emptyValue'];
  many?: TMany;
  validation?: Validation<TPlugin, TValues>;
  // TODO initialState
};

export type CreatedPlugin<
  TPlugin extends AnyPlugin,
  TValues extends Values,
  TMany extends boolean = boolean,
> = {
  plugin: PluginObject<TPlugin>;
  options: PluginOptions<TPlugin, TValues, TMany>;
};

export function createPlugin<TPlugin extends AnyPlugin>(
  plugin: PluginObject<TPlugin>,
): <TValues extends Values, TMany extends boolean = boolean>(
  options: PluginOptions<TPlugin, TValues, TMany>,
) => CreatedPlugin<TPlugin, TValues, TMany> {
  return <TValues extends Values, TMany extends boolean = boolean>(
    options: PluginOptions<TPlugin, TValues, TMany>,
  ) => ({ plugin, options });
}
