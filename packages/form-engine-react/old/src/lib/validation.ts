import { FieldState } from './fieldState';
import type { AnyPlugin, RuntimePlugin } from './plugin';
import type { MaybePromise } from './util';
import type { Values } from './values';

/** Enum which defines when a form field is validated. */
export enum ValidationMode {
  ON_CHANGE = 'ON_CHANGE',
  ON_BLUR = 'ON_BLUR',
  AFTER_BLUR = 'AFTER_BLUR',
  ON_SUBMIT = 'ON_SUBMIT',
}

/** Base Field validation type */
export type Validation<
  TPlugin extends AnyPlugin,
  TValues extends Values,
> = TPlugin['validation'] & {
  /** Optional (default: `config.validate.validationMode ?? ValidationMode.AFTER_BLUR`), when in the form lifecycle the field is validated */
  mode?: ValidationMode;
  /** Optional (default: `null`), add this error message when the field is empty */
  required?: string;
  /** Optional, custom validation function */
  validate?: (args: {
    values: TValues;
    value: TPlugin['internalValue'] | TPlugin['emptyValue'];
  }) => MaybePromise<string[]>;
};

export async function validateField(
  createdPlugin: RuntimePlugin<AnyPlugin, Values>,
  fieldState: FieldState,
  value: unknown,
  values: Values,
): Promise<string[]> {
  const { plugin, options } = createdPlugin;
  if (!options.validation || fieldState !== FieldState.ENABLED) return [];

  // Required check
  if (
    options.validation.required &&
    JSON.stringify(value) === JSON.stringify(plugin.emptyValue ?? null)
  )
    return [options.validation.required];

  // Plugin-specific validation options
  if (plugin.validate) {
    const pluginErrors = await plugin.validate(value, options.validation);
    if (pluginErrors.length > 0) return pluginErrors;
  }

  // Custom validate function
  if (options.validation.validate) {
    const validateErrors = await options.validation.validate({ value, values });
    if (validateErrors.length > 0) return validateErrors;
  }

  return [];
}

export type NumberValueValidation = (
  | { exact: number }
  | { gte: number }
  | { lte: number }
  | { gt: number }
  | { lt: number }
  | { gte: number; lte: number }
  | { gte: number; lt: number }
  | { gt: number; lte: number }
  | { gt: number; lt: number }
) & { getMessage: (n: number) => string };

export type StringValidation = {
  length?: NumberValueValidation;
  match?: { pattern: RegExp; message: string };
};

export type EmailValidation = {
  length?: NumberValueValidation;
  isValidEmail?: string;
};

export type NumberValidation = {
  value?: NumberValueValidation;
  integer?: string;
};

export function validateNumberValue(
  n: number,
  v: NumberValueValidation,
): string[] {
  if (
    ('exact' in v && n !== v.exact) ||
    ('lt' in v && n >= v.lt) ||
    ('lte' in v && n > v.lte) ||
    ('gt' in v && n <= v.gt) ||
    ('gte' in v && n < v.gte)
  )
    return [v.getMessage(n)];

  return [];
}

export function validateStringField(
  value: string | null,
  validation: StringValidation,
): string[] {
  // Length check
  if (validation.length) {
    const errors = validateNumberValue((value ?? '').length, validation.length);
    if (errors.length > 0) return errors;
  }

  // Regex check
  if (validation.match && !validation.match.pattern.exec(value ?? ''))
    return [validation.match.message];

  return [];
}

export function validateEmailField(
  value: string | null,
  validation: EmailValidation,
): string[] {
  return validateStringField(value, {
    ...validation,
    match: {
      message: validation.isValidEmail ?? '',
      pattern:
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    },
  });
}

export function validateNumberField(
  value: number | null,
  validation: NumberValidation,
): string[] {
  // Value check
  if (validation.value) {
    if (value === null) return [];
    const errors = validateNumberValue(value, validation.value);
    if (errors.length > 0) return errors;
  }

  // Integer check
  if (validation.integer && !Number.isInteger(value))
    return [validation.integer];

  return [];
}

// export interface FileValidation {
//   size?: NumberValueValidation;
// }

// function validateColorField(value: string | null, validation: ColorValidation): string {
//   if (/^#([0-9a-f]{3}){1,2}$/i.test(value ?? '') && validation.required) return validation.required;
//   return '';
// }

// function validateFileField(value: File | null, validation: FileValidation): string {
//   if (validation.size) {
//     if (value === null) return validation.size.message;
//     return validateNumberValue(value.size, validation.size);
//   }
//   return '';
// }
