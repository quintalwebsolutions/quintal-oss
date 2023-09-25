import type { CreatedPlugin, Plugin, PluginFromValue } from './plugin';
import type { ValidationMode } from './validation';
import type { AnyValue, Values } from './values';

type ButtonConfig = {
  /** Optional, the text displayed on the button. Default = "Submit" */
  label?: string;
  /** Optional, the text displayed on the button while the form is performing an arbitrary action. Default = isSubmittingLabel ?? label ?? "Loading..." */
  isLoadingLabel?: string;
  /** Optional, the text displayed on the button while the form is submitting. Default = isLoadingLabel ?? label ?? "Submitting..." */
  isSubmittingLabel?: string;
};

type FieldsConfig<TValues extends Values> = {
  [FieldName in keyof TValues]: TValues[FieldName] extends AnyValue
    ? CreatedPlugin<PluginFromValue<TValues[FieldName]>, TValues>
    : CreatedPlugin<Plugin<TValues[FieldName]>, TValues>;
};

export type Config<TValues extends Values> = {
  /** Optional, declares the fields of the form */
  fields?: FieldsConfig<TValues>;
  /** Optional, configures the form's submit button */
  submitButton?: ButtonConfig;
  /** Optional, configures the form's reset button */
  resetButton?: ButtonConfig;
  /** Optional, configures the form's global validation settings */
  validation?: {
    /** Optional (default: ValidationMode.AFTER_BLUR), when in the form lifecycle the fields are validated by default. */
    mode?: ValidationMode;
  };
};

export type State<TValues extends Values> = {
  [FieldName in keyof TValues]: {};
};
