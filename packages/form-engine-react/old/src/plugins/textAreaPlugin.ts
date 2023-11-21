import type { Plugin, StringValidation, ValueFromPlugin } from '../lib';
import { createPlugin, validateStringField } from '../lib';

export type TextAreaPlugin = Plugin<
  string,
  {
    validation: StringValidation;
    options: { placeholder?: string; rows?: number };
  }
>;

export type TextAreaPluginValue = ValueFromPlugin<TextAreaPlugin>;

export const textAreaPlugin = createPlugin<TextAreaPlugin>({
  parse: (value) => value || null,
  serialize: (value) => value ?? '',
  validate: validateStringField,
});
