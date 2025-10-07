import type { Plugin, PluginObject, PluginValue } from '../lib/index.ts';

export type SwitchPlugin = Plugin<boolean, { emptyValue: false }>;

export type SwitchPluginValue = PluginValue<SwitchPlugin>;

export const switchPlugin: PluginObject<SwitchPlugin> = {
  defaultInitialValue: false,
};
