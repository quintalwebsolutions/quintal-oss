import type {
  ComponentProps,
  ChangeEventHandler,
  FocusEventHandler,
  JSXElementConstructor,
  HTMLInputTypeAttribute,
} from 'react';
import type { DefinePluginArgs, Plugin } from '../lib';
import { createPlugin } from '../lib';

type DefineComponentProps<
  TName extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
  T extends ComponentProps<TName>,
> = T;

type InputProps<TInputType extends HTMLInputTypeAttribute> =
  DefineComponentProps<
    'input',
    {
      'type': TInputType;
      'id': string;
      'name': string;
      'value': string;
      'placeholder': string;
      'disabled': boolean;
      'onChange': ChangeEventHandler<HTMLInputElement>;
      'onBlur': FocusEventHandler<HTMLInputElement>;
      'aria-describedby': string;
      'autoComplete': string;
    }
  >;

type LabelProps = DefineComponentProps<
  'label',
  { htmlFor: string; children: string }
>;

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
