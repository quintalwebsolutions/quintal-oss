import type { ChangeEventHandler, ComponentProps, FocusEventHandler, HTMLInputTypeAttribute, JSXElementConstructor } from 'react';

export type DefineComponentProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is how react internally defines this type
  TName extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
  T extends ComponentProps<TName>,
> = T;

export type InputProps<TInputType extends HTMLInputTypeAttribute> =
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

export  type LabelProps = DefineComponentProps<
  'label',
  { htmlFor: string; children: string }
>;