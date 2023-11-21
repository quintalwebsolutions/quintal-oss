import type {
  ComponentProps,
  FormEventHandler,
  JSXElementConstructor,
  ReactNode,
} from 'react';

type ToggleAutoComplete = 'off' | 'on';

type NameAutoComplete =
  | 'name'
  | 'honorific-prefix'
  | 'given-name'
  | 'additional-name'
  | 'family-name'
  | 'honorific-suffix'
  | 'nickname';

type AuthenticationAutoComplete =
  | 'email'
  | 'username'
  | 'new-password'
  | 'current-password'
  | 'one-time-code';

type OrganisationAutoComplete = 'organisation' | 'organisation-title';

type NestedAddressAutoComplete =
  | 'street-address'
  | 'address-line1'
  | 'address-line2'
  | 'address-line3'
  | 'address-level1'
  | 'address-level2'
  | 'address-level3'
  | 'address-level4'
  | 'country'
  | 'country-name'
  | 'postal-code';

type AddressAutoComplete =
  | NestedAddressAutoComplete
  | 'shipping'
  | `shipping ${NestedAddressAutoComplete}`
  | 'billing'
  | `billing ${NestedAddressAutoComplete}`;

type CreditCardAutoComplete =
  | 'cc-name'
  | 'cc-given-name'
  | 'cc-additional-name'
  | 'cc-family-name'
  | 'cc-number'
  | 'cc-exp'
  | 'cc-exp-month'
  | 'cc-exp-year'
  | 'cc-csc'
  | 'cc-type';

type TransactionAutoComplete = 'transaction-currency' | 'transaction-amount';

type BirthdayAutoComplete = 'bday' | 'bday-day' | 'bday-month' | 'bday-year';

type PhoneAutoComplete =
  | 'tel'
  | 'tel-country-code'
  | 'tel-national'
  | 'tel-area-code'
  | 'tel-local'
  | 'tel-extension';

type MiscAutoComplete =
  | 'language'
  | 'sex'
  | 'impp'
  | 'url'
  | 'photo'
  | 'webauthn';

// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/autocomplete
export type AutoComplete =
  | ToggleAutoComplete
  | NameAutoComplete
  | AuthenticationAutoComplete
  | OrganisationAutoComplete
  | AddressAutoComplete
  | CreditCardAutoComplete
  | TransactionAutoComplete
  | BirthdayAutoComplete
  | PhoneAutoComplete
  | MiscAutoComplete;

// Source: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input
export type InputType =
  | 'button'
  | 'checkbox'
  | 'color'
  | 'date'
  | 'datetime-local'
  | 'email'
  | 'file'
  | 'hidden'
  | 'image'
  | 'month'
  | 'number'
  | 'password'
  | 'radio'
  | 'range'
  | 'reset'
  | 'search'
  | 'submit'
  | 'tel'
  | 'text'
  | 'time'
  | 'url'
  | 'week';

export type DefineComponentProps<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- This is how react internally defines this type
  TComponent extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
  TProps extends ComponentProps<TComponent>,
> = TProps;

export type FormProps = DefineComponentProps<
  'form',
  {
    id: string;
    name: string;
    autoComplete: ToggleAutoComplete;
    children: ReactNode;
  } & (
    | {
        onSubmit: FormEventHandler<HTMLFormElement>;
        onReset: FormEventHandler<HTMLFormElement>;
        action?: never;
      }
    | {
        onSubmit?: never;
        onReset?: never;
        // TODO fix action typing
        // action: (formData: FormData) => void;
        action: string;
      }
  )
>;

export type ButtonProps = DefineComponentProps<
  'button',
  {
    disabled: boolean;
    form: string;
    type: 'submit' | 'reset' | 'button';
    children: string;
  }
>;

export type LabelProps = DefineComponentProps<
  'label',
  {
    htmlFor: string;
    children: string;
  }
>;

export type DescriptionProps = DefineComponentProps<
  'p',
  {
    id: string;
    children: string;
  }
>;
