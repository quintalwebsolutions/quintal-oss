import type { ComponentProps } from 'react';
import type { UnwrapValue, Values } from '../lib';
import type { State } from './useFormState';

type FormProps = {
  register: Pick<ComponentProps<'form'>, 'onSubmit' | 'onReset'>;
  onSubmit: () => void;
  onReset: () => void;
  errors: string[];
  isLoading: boolean;
};

type ButtonProps = {
  register: Pick<
    ComponentProps<'button'>,
    'children' | 'disabled' | 'type' | 'onClick'
  >;
  label: string;
  isDisabled: boolean;
  isLoading: boolean;
  type: 'submit' | 'reset' | 'button';
  onClick: () => void;
};

type FieldProps<TTargetValue> = {
  register: {
    label: Pick<ComponentProps<'label'>, 'htmlFor'>;
    input: Pick<
      ComponentProps<'input'>,
      'id' | 'name' | 'value' | 'checked' | 'onBlur' | 'onChange'
    >;
    description: Pick<ComponentProps<'p'>, 'aria-describedby'>;
  };
  onBlur: () => void;
  onChange: (targetValue: TTargetValue) => void;
  errors: string[];
};

export type Form<TValues extends Values> = {
  form: FormProps;
  submitButton: ButtonProps;
  resetButton: ButtonProps;
  fields: {
    [FieldName in keyof TValues]: FieldProps<
      UnwrapValue<TValues[FieldName], 'serialized'>
    >;
  };
};

export function useFormProps<TValues extends Values>(
  formState: State<TValues> | null,
): Form<TValues> {
  return null;
}
