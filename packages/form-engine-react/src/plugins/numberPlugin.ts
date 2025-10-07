import type { Plugin, PluginObject, PluginValue } from '../lib/index.ts';

export type NumberPlugin = Plugin<number, { serializedValue: string }>;

export type NumberPluginValue = PluginValue<NumberPlugin>;

export const numberPlugin: PluginObject<NumberPlugin> = {
  parse: (value) => {
    const parsedValue = Number.parseFloat(value);
    return Number.isNaN(parsedValue) ? null : parsedValue;
  },
  serialize: (value) => value?.toString() ?? '',
};
