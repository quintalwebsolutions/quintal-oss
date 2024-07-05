import { createPlugin } from '../lib';
import type { Plugin, ValueFromPlugin } from '../lib';

export type CheckPlugin = Plugin<
  boolean | 'indeterminate',
  { emptyValue: false }
>;

export type CheckPluginValue = ValueFromPlugin<CheckPlugin>;

export const checkPlugin = createPlugin<CheckPlugin>({ emptyValue: false });
