import type { ComponentProps } from 'react';

type MaybeDomEvent = (e?: { preventDefault: () => void }) => void;
type MaybeDomChangeEvent = (e?: {
  preventDefault: () => void;
  target: { value: string };
}) => void;

type FormComponentProps<
  TNativeKey extends keyof React.JSX.IntrinsicElements,
  TNativeProps extends ComponentProps<TNativeKey>,
  TRawProps,
> = {
  register: TNativeProps;
} & TRawProps;

export type FormProps = FormComponentProps<
  'form',
  {
    onSubmit: MaybeDomEvent;
    onReset: MaybeDomEvent;
  },
  {
    onSubmit: () => void;
    onReset: () => void;
    errors: string[];
    isLoading: boolean;
  }
>;

export type ButtonProps = FormComponentProps<
  'button',
  {
    children: string;
    disabled: boolean;
    type: 'submit' | 'reset' | 'button';
    onClick: MaybeDomEvent;
  },
  {
    label: string;
    isDisabled: boolean;
    isLoading: boolean;
    type: 'submit' | 'reset' | 'button';
    onClick: () => void;
  }
>;

// TODO have 'input', 'label', and 'description' keys under register
export type FieldProps<TTargetValue> = FormComponentProps<
  'input',
  {
    onBlur: MaybeDomEvent;
    onChange: MaybeDomChangeEvent;
  },
  {
    onBlur: () => void;
    onChange: (targetValue: TTargetValue) => void;
    errors: string[];
  }
>;
