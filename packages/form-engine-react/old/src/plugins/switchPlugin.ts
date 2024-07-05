import { createPlugin } from '../lib';
import type { Plugin, ValueFromPlugin } from '../lib';

export type SwitchPlugin = Plugin<boolean, { emptyValue: false }>;

export type SwitchPluginValue = ValueFromPlugin<SwitchPlugin>;

export const switchPlugin = createPlugin<SwitchPlugin>({
  emptyValue: false,
});
