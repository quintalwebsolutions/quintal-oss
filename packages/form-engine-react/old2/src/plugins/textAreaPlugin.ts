import type { ChangeEventHandler, FocusEventHandler } from 'react';
import type { DefinePluginArgs, Plugin } from '../lib';
import { createPlugin } from '../lib';
import type {
  AutoComplete,
  DefineComponentProps,
  LabelProps,
  DescriptionProps,
} from '../lib/props';

type TextAreaPluginValidation = any;

export type TextAreaPluginArgs = DefinePluginArgs<{
  validation: TextAreaPluginValidation;
  options: {
    label?: string;
    description?: string;
    placeholder?: string;
    autoComplete?: AutoComplete;
    rows?: number;
  };
  props: {
    textArea: DefineComponentProps<
      'textarea',
      {
        'id': string;
        'name': string;
        'value': string; // TODO make uncontrolled variant using defaultValue
        'disabled': boolean;
        'onChange': ChangeEventHandler<HTMLTextAreaElement>;
        'onBlur': FocusEventHandler<HTMLTextAreaElement>;
        'aria-describedby': string;
        'placeholder': string;
        'autoComplete': string;
        'rows': number;
      }
    >;
    label: LabelProps;
    description: DescriptionProps;
  };
}>;

export type TextAreaPlugin = Plugin<string, TextAreaPluginArgs>;

export const textAreaPlugin = createPlugin<TextAreaPlugin>({});
