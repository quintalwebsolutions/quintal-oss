import type { NumberValidation, Plugin, ValueFromPlugin } from '../lib';
import { validateNumberField, createPlugin } from '../lib';

export type NumberPlugin = Plugin<
  number,
  {
    serializedValue: string;
    validation: NumberValidation;
    options: { placeholder?: string };
  }
>;

export type NumberPluginValue = ValueFromPlugin<NumberPlugin>;

export const numberPlugin = createPlugin<NumberPlugin>({
  parse: (value) => {
    const parsedValue = parseFloat(value);
    return !isNaN(parsedValue) ? parsedValue : null;
  },
  serialize: (value) => value?.toString() ?? '',
  validate: validateNumberField,
});
