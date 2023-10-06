import type { DefinePluginArgs,  Plugin } from '../lib';
import { createPlugin } from '../lib';
import type { InputProps, LabelProps } from '../lib/props';

export type TextInputPluginArgs = DefinePluginArgs<{
  validation: TextInputPluginValidation;
  options: { placeholder?: string };
  props: {
    input: InputProps<'text'>;
    label: LabelProps;
  };
}>;

export type TextInputPlugin = Plugin<string, TextInputPluginArgs>;

export const textInputPlugin = createPlugin<TextInputPlugin>({});
