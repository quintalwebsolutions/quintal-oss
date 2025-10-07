import type { Plugin, PluginObject, PluginValue } from '../lib/index.ts';

export type TextPlugin = Plugin<string>;

export type TextPluginValue = PluginValue<TextPlugin>;

export const textPlugin: PluginObject<TextPlugin> = {
  parse: (value) => value || null,
  serialize: (value) => value ?? '',
};
