import type { ChangeEventHandler, FocusEventHandler } from 'react';
import type { DefinePluginArgs, Plugin } from '../lib';
import { createPlugin } from '../lib';
import type {
  AutoComplete,
  DefineComponentProps,
  LabelProps,
  DescriptionProps,
} from '../lib/props';

export type TextInputPluginValidation = any;

export type TextInputPluginArgs = DefinePluginArgs<{
  validation: TextInputPluginValidation;
  options: {
    label?: string;
    description?: string;
    placeholder?: string;
    autoComplete?: AutoComplete;
  };
  props: {
    input: DefineComponentProps<
      'input',
      {
        'type': 'text';
        'id': string;
        'name': string;
        'value': string; // TODO make uncontrolled variant using defaultValue
        'disabled': boolean;
        'onChange': ChangeEventHandler<HTMLInputElement>;
        'onBlur': FocusEventHandler<HTMLInputElement>;
        'aria-describedby': string;
        'placeholder': string;
        'autoComplete': AutoComplete;
      }
    >;
    label: LabelProps;
    description: DescriptionProps;
  };
}>;

export type TextInputPlugin = Plugin<string, TextInputPluginArgs>;

export const textInputPlugin = createPlugin<TextInputPlugin>({
  getProps: (fieldState, actions) => ({
    label: {
      htmlFor: id,
      children: label,
    },
    input: {
      type: 'text',
      id,
      name,
      value: value ?? '',
      placeholder,
      disabled: state === 'disabled',
      onChange: (e) => actions.handleChange(e.target.value || null),
      onBlur: () => actions.handleBlur(),
    },
  }),
});
