import type { Plugin, PluginObject, PluginValue } from '../lib/index.ts';

export type CheckPlugin = Plugin<boolean | 'indeterminate', { emptyValue: false }>;

export type CheckPluginValue = PluginValue<CheckPlugin>;

export const checkPlugin: PluginObject<CheckPlugin> = {
  defaultInitialValue: false,
};
