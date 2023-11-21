import type { Plugin, StringValidation, ValueFromPlugin } from '../lib';
import { createPlugin, validateStringField } from '../lib';

export type TextPlugin = Plugin<
  string,
  { validation: StringValidation; options: { placeholder?: string } }
>;

export type TextPluginValue = ValueFromPlugin<TextPlugin>;

export const textPlugin = createPlugin<TextPlugin>({
  parse: (value) => value || null,
  serialize: (value) => value ?? '',
  validate: validateStringField,
});
