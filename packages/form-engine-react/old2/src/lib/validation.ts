import type { AnyFields } from '../../../src/lib/fields';
import type { AnyPlugin } from './plugin';
import type { MaybePromise } from '../../../src/lib/util';

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
