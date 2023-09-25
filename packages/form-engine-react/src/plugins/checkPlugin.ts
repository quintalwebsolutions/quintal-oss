import type { Plugin, PluginObject, ValueFromPlugin } from '../lib';

export type CheckPlugin = Plugin<
  boolean | 'indeterminate',
  { emptyValue: false }
>;

export type CheckPluginValue = ValueFromPlugin<CheckPlugin>;

export const checkPlugin: PluginObject<CheckPlugin> = {
  defaultInitialValue: false,
};
