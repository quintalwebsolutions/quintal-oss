import type { ButtonProps, FormProps } from '../lib';
import type { Values } from '../lib/values';

type Form<TValues extends Values> = {
  form: FormProps;
  submitButton: ButtonProps;
  resetButton: ButtonProps;
};

type ButtonConfig = {
  /** Optional, the text displayed on the button */
  label?: string;
  /** Optional, the text displayed on the button while the form is performing an arbitrary action */
  isLoadingLabel?: string;
  /** Optional, the text displayed on the button while the form is submitting */
  isSubmittingLabel?: string;
};

type Config<TValues extends Values> = {
  /** Optional, configures the form's submit button */
  submitButton?: ButtonConfig;
  /** Optional, configures the form's reset button */
  resetButton?: ButtonConfig;
};

export function useForm<TValues extends Values>(
  config: Config<TValues>,
): Form<TValues> {
  console.log(config);
  return null;
}
