import type { Plugin, PluginObject, PluginValue } from '../lib';

export type TextPlugin = Plugin<string>;

export type TextPluginValue = PluginValue<TextPlugin>;

export const textPlugin: PluginObject<TextPlugin> = {
  parse: (value) => value || null,
  serialize: (value) => value ?? '',
};
