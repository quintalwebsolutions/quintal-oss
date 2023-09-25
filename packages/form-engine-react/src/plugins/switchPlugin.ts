import type { Plugin, PluginObject, ValueFromPlugin } from '../lib';

export type SwitchPlugin = Plugin<boolean, { emptyValue: false }>;

export type SwitchPluginValue = ValueFromPlugin<SwitchPlugin>;

export const switchPlugin: PluginObject<SwitchPlugin> = {
  defaultInitialValue: false,
};
