import type { Value } from './values';

type PluginArgs = {
  /** Optional: What the internal value serializes to. Default: TInternalValue */
  serializedValue?: unknown;
  /** Optional: How a empty internal value should be represented. Default: null */
  emptyValue?: unknown;
};

/** Utility type to define a custom plugin value */
export type Plugin<TInternalValue, TPluginArgs extends PluginArgs = Record<string, unknown>> = {
  internalValue: TInternalValue;
  serializedValue: keyof TPluginArgs extends 'serializedValue'
    ? TPluginArgs['serializedValue']
    : TInternalValue;
  emptyValue: keyof TPluginArgs extends 'emptyValue' ? TPluginArgs['emptyValue'] : null;
};

export type AnyPlugin = {
  internalValue: unknown;
  serializedValue: unknown;
  emptyValue: unknown;
};

/** Utility type used to define a custom field plugin */
export type PluginObject<TPlugin extends AnyPlugin> = (null extends
  | TPlugin['internalValue']
  | TPlugin['emptyValue']
  ? {
      /** Optional (default: `null`), define the default initial value for this field, unless otherwise specified by the hook user */
      defaultInitialValue?: TPlugin['internalValue'] | TPlugin['emptyValue'];
    }
  : {
      /** Define the default initial value for this field, unless otherwise specified by the hook user */
      defaultInitialValue: TPlugin['internalValue'] | TPlugin['emptyValue'];
    }) &
  (TPlugin['serializedValue'] extends TPlugin['internalValue'] | TPlugin['emptyValue']
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
  (TPlugin['internalValue'] | TPlugin['emptyValue'] extends TPlugin['serializedValue']
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
      });

/** Optional (default: `() => []`), define how to validate an internal value. The string returned is the error message shown. '' is no error message */
// validate?: (
//   value: Value | null,
//   validation: Validation & FieldValidation<Value>,
// ) => string;

export type PluginValue<TPlugin extends AnyPlugin> = Value<
  TPlugin['internalValue'],
  { serialized: TPlugin['serializedValue']; empty: TPlugin['emptyValue'] }
>;
