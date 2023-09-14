import type { Plugin, PluginObject, PluginValue } from '../lib';

export type NumberPlugin = Plugin<number, { serializedValue: string }>;

export type NumberPluginValue = PluginValue<NumberPlugin>;

export const numberPlugin: PluginObject<NumberPlugin> = {
  parse: (value) => {
    const parsedValue = parseFloat(value);
    return !isNaN(parsedValue) ? parsedValue : null;
  },
  serialize: (value) => value?.toString() ?? '',
};
