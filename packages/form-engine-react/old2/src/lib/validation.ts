import type { AnyFields } from './fields';
import type { AnyPlugin } from './plugin';
import type { MaybePromise } from './util';

/** Enum which defines when a form field is validated. */
export enum ValidationMode {
  /** Validate a field with every change */
  ON_CHANGE = 'ON_CHANGE',
  /** Validate the field every time the field is deselected (i.e. blurred) */
  ON_BLUR = 'ON_BLUR',
  /** Don't validate a field until it has been blurred once, then validate it on change */
  AFTER_BLUR = 'AFTER_BLUR',
  /** Only validate the field in the event of a form submission */
  ON_SUBMIT = 'ON_SUBMIT',
}

/** Base Field validation type */
export type Validation<
  TPlugin extends AnyPlugin,
  TFields extends AnyFields,
> = TPlugin['validation'] & {
  /** Optional (default: `config.validate.validationMode ?? ValidationMode.AFTER_BLUR`), when in the form lifecycle the field is validated */
  mode?: ValidationMode;
  /** Optional (default: `null`), add this error message when the field is empty */
  required?: string;
  /** Optional, custom validation function */
  validate?: (args: {
    fields: TFields;
    value: TPlugin['value'] | TPlugin['emptyValue'];
  }) => MaybePromise<string[]>;
};
