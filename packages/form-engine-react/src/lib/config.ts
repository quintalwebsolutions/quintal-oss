import type { State } from '../hooks/useFormState';
import type { RuntimePlugin, Plugin, PluginFromValue } from './plugin';
import type { MaybePromise, MaybePromiseVoid, MaybeVoid } from './util';
import type { ValidationMode } from './validation';
import type { AnyValue, UnwrapValue, Values } from './values';

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
    ? RuntimePlugin<PluginFromValue<TValues[FieldName]>, TValues>
    : RuntimePlugin<Plugin<TValues[FieldName]>, TValues>;
};

type InitArgs<TValues extends Values> = {
  initialState: State<TValues>;
  state: State<TValues>;
};

type BlurArgs<TValues extends Values> = InitArgs<TValues> & {
  fieldName: keyof TValues;
  // TODO link fieldName to fieldName
  /** `fieldIndex` is only supplied when the changed field has `many: true` */
  fieldIndex?: number;
};

type ChangeArgs<TValues extends Values> = InitArgs<TValues> & {
  fieldName: keyof TValues;
  // TODO link targetValue to fieldName
  targetValue: unknown;
  // TODO link fieldName to fieldName
  /** `fieldIndex` is only supplied when the changed field has `many: true` */
  fieldIndex?: number;
};

type SubmitArgs<TValues extends Values> = InitArgs<TValues> & {
  values: UnwrapValue<TValues>;
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
  /** Optional, synchronous function that fires on a form field change event */
  onChange?: (args: ChangeArgs<TValues>) => MaybeVoid<State<TValues>>;
  /** Optional, sync or async function that fires after a form field change event */
  changeEffect?: (args: ChangeArgs<TValues>) => MaybePromise<void>;
  /** Optional, synchronous function that fires on a form field blur event */
  onBlur?: (args: BlurArgs<TValues>) => MaybeVoid<State<TValues>>;
  /** Optional, sync or async function that fires after a form field blur event */
  blurEffect?: (args: BlurArgs<TValues>) => MaybePromise<void>;
  /** Optional, defines what should happen when the form state is initialized */
  onInit?: (args: InitArgs<TValues>) => MaybePromiseVoid<State<TValues>>;
  /** Optional, defines what should happen on a form reset event */
  onReset?: (args: InitArgs<TValues>) => MaybePromiseVoid<State<TValues>>;
  /** Optional, defines what should happen on a form submit event where no errors are present in the form */
  onSubmit?: (args: SubmitArgs<TValues>) => MaybePromiseVoid<State<TValues>>;
  /** Optional, defines what should happen on any form submit event, even if errors are present in the form */
  submitEffect?: (args: SubmitArgs<TValues>) => MaybePromise<void>;
};
