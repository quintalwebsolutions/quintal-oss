import type { AnyFields } from './fields';

type PluginArgs = {
  /** Optional: How an empty value should be represented. Default: `null` */
  emptyValue?: unknown;
  /** Optional: What validation options the plugin should expose. Default: `Record<string, never>` */
  validation?: Record<string, unknown>;
  /** Optional: What additional options the plugin should expose. These options are exposed to the DOM aswell as internally. Default: `Record<string, never>` */
  options?: Record<string, unknown>;
  /** Optional: How the internal field state should map to a (set of) DOM element(s) props. Default: `Record<string, never>` */
  props?: Record<string, unknown>;
};

export type DefinePluginArgs<TPluginArgs extends PluginArgs> = TPluginArgs;

type GetKey<
  TPluginArgs extends PluginArgs,
  TKey extends keyof TPluginArgs,
  TIfFalse = Record<string, never>,
> = TKey extends keyof TPluginArgs
  ? string extends keyof TPluginArgs
    ? TIfFalse
    : TPluginArgs[TKey]
  : TIfFalse;

export type Plugin<
  TValue,
  TPluginArgs extends PluginArgs = Record<string, unknown>,
> = {
  value: TValue;
  emptyValue: GetKey<TPluginArgs, 'emptyValue', null>;
  validation: GetKey<TPluginArgs, 'validation'>;
  options: GetKey<TPluginArgs, 'options'>;
  props: GetKey<TPluginArgs, 'props'>;
};

export type AnyPlugin = { value: unknown } & Required<PluginArgs>;

type Merge<T> = {
  [K in keyof T]: T[K];
} & unknown;

export type PluginConfig<TPlugin extends AnyPlugin> = Merge<
  (null extends TPlugin['emptyValue']
    ? {
        /** Optional (default: `null`), define the default initial value for this field, unless otherwise specified by the hook user */
        emptyValue?: TPlugin['emptyValue'];
      }
    : {
        /** Define the default initial value for this field, unless otherwise specified by the hook user */
        emptyValue: TPlugin['emptyValue'];
      }) &
    (TPlugin['props'] extends Record<string, never>
      ? {
          /** Optional (default: `() => ({})`), define how the internal form state should map to a set of DOM props. */
          getProps?: (fieldState, actions) => TPlugin['props'];
        }
      : {
          /** Define how the internal form state should map to a set of DOM props. */
          getProps: (fieldState, actions) => TPlugin['props'];
        })
>;

export type PluginOptions<
  TPlugin extends AnyPlugin,
  TFields extends AnyFields,
  TMany extends boolean,
> = {
  many?: TMany;
  initialValue?: TMany extends true
    ? (TPlugin['value'] | TPlugin['emptyValue'])[]
    : TPlugin['value'] | TPlugin['emptyValue'];
  validation?: Validation<TPlugin, TFields, TMany>;
  initialState?: FieldState;
};

export type RuntimePlugin<
  TPlugin extends AnyPlugin,
  TFields extends AnyFields,
  TMany extends boolean = boolean,
> = {
  config: PluginConfig<TPlugin>;
  options: PluginOptions<TPlugin, TFields, TMany>;
};

export type RuntimePluginConstructor<TPlugin extends AnyPlugin> = <
  TFields extends AnyFields,
  TMany extends boolean = boolean,
>(
  options: PluginOptions<TPlugin, TFields, TMany>,
) => RuntimePlugin<TPlugin, TFields, TMany>;

export function createPlugin<TPlugin extends AnyPlugin>(
  config: PluginConfig<TPlugin>,
): RuntimePluginConstructor<TPlugin> {
  return <TFields extends AnyFields, TMany extends boolean = boolean>(
    options: PluginOptions<TPlugin, TFields, TMany>,
  ) => ({ config, options });
}
