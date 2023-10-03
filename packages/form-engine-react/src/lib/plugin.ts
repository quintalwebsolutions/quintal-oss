import type { FieldState } from './fieldState';
import type { MaybePromise } from './util';
import type { Validation } from './validation';
import type { AnyValue, Value, Values } from './values';

type PluginArgs = {
  /** Optional: What the internal value serializes to. Default: `TInternalValue` */
  serializedValue?: unknown;
  /** Optional: How a empty internal value should be represented. Default: `null` */
  emptyValue?: unknown;
  /** Optional: What validation options the plugin should expose. Default: `Record<string, never>` */
  validation?: Record<string, unknown>;
  /** Optional: What additional options the plugin should expose. These options are exposed to the DOM aswell as internally. Default: `Record<string, never>` */
  options?: Record<string, unknown>;
  /** Optional: What additional options the plugin should expose internally. Default: `Record<string, never>` */
  internalOptions?: Record<string, unknown>;
};

type GetKey<
  TPluginArgs extends PluginArgs,
  TKey extends keyof TPluginArgs,
  TIfFalse = Record<string, never>,
> = TKey extends keyof TPluginArgs
  ? string extends keyof TPluginArgs
    ? TIfFalse
    : TPluginArgs[TKey]
  : TIfFalse;

/** Utility type to define a custom plugin value */
export type Plugin<
  TInternalValue,
  TPluginArgs extends PluginArgs = Record<string, unknown>,
> = {
  internalValue: TInternalValue;
  serializedValue: GetKey<TPluginArgs, 'serializedValue', TInternalValue>;
  emptyValue: GetKey<TPluginArgs, 'emptyValue', null>;
  validation: GetKey<TPluginArgs, 'validation'>;
  options: GetKey<TPluginArgs, 'options'>;
  internalOptions: GetKey<TPluginArgs, 'internalOptions'>;
};

export type AnyPlugin = {
  internalValue: unknown;
  serializedValue: unknown;
  emptyValue: unknown;
  validation: Record<string, unknown>;
  options: Record<string, unknown>;
  internalOptions: Record<string, unknown>;
};

type Merge<T> = {
  [K in keyof T]: T[K];
} & unknown;

/** Utility type used to define a custom field plugin */
export type PluginObject<TPlugin extends AnyPlugin> = Merge<
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
    }
>;

export type ValueFromPlugin<TPlugin extends AnyPlugin> = Value<
  TPlugin['internalValue'],
  { serialized: TPlugin['serializedValue']; empty: TPlugin['emptyValue'] }
>;

// FIXME for some reason, this doesn't infer the generic type argument correctly.
// The fix below works but is not ideal due to code duplication
// export type PluginFromValue<TValue extends AnyValue> = Plugin<
//   TValue['__internal__'],
//   { serializedValue: TValue['__serialized__']; emptyValue: TValue['__empty__'] }
// >;
export type PluginFromValue<TValue extends AnyValue> = {
  internalValue: TValue['__internal__'];
  serializedValue: TValue['__serialized__'];
  emptyValue: TValue['__empty__'];
  // TODO get rid of these ANYs
  validation: any;
  options: any;
  internalOptions: any;
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
  initialState?: FieldState;
};

export type RuntimePlugin<
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
) => RuntimePlugin<TPlugin, TValues, TMany> {
  return <TValues extends Values, TMany extends boolean = boolean>(
    options: PluginOptions<TPlugin, TValues, TMany>,
  ) => ({ plugin, options });
}
