import type { Plugin, ValueFromPlugin } from '../lib';
import { createPlugin } from '../lib';

// TODO validate that a given string is of the provided options
export type SelectPlugin = Plugin<
  string,
  {
    options: { placeholder?: string };
    internalOptions: { options: { value: string; label?: string }[] };
  }
>;

export type SelectPluginValue = ValueFromPlugin<SelectPlugin>;

export const selectPlugin = createPlugin<SelectPlugin>({
  parse: (value) => value || null,
  serialize: (value) => value ?? '',
});
