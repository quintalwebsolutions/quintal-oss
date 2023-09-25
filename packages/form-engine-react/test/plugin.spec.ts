import { it, describe, expectTypeOf } from 'vitest';
import type {
  CheckPlugin,
  NumberPlugin,
  NumberValidation,
  PluginObject,
  StringValidation,
  TextPlugin,
  Validation,
  Values,
} from '../src';
import type { MaybePromise } from '../src/lib/util';

describe('plugin', () => {
  it('Allows the user to create a plugin with an internal value type, and optionally the serialized value type and empty type', () => {
    expectTypeOf<TextPlugin>().toEqualTypeOf<{
      internalValue: string;
      serializedValue: string;
      emptyValue: null;
      validation: StringValidation;
    }>();

    expectTypeOf<NumberPlugin>().toEqualTypeOf<{
      internalValue: number;
      serializedValue: string;
      emptyValue: null;
      validation: NumberValidation;
    }>();

    type CheckValue = boolean | 'indeterminate';
    expectTypeOf<CheckPlugin>().toEqualTypeOf<{
      internalValue: CheckValue;
      serializedValue: CheckValue;
      emptyValue: false;
      validation: Record<string, unknown>;
    }>();

    type Prettify<T> = {
      [K in keyof T]: T[K];
    } & unknown;

    type TextPluginObject = Prettify<PluginObject<TextPlugin>>;
    expectTypeOf<TextPluginObject>().toEqualTypeOf<{
      emptyValue?: null;
      parse?: (value: string) => string | null;
      serialize: (value: string | null) => string;
      validate?: (
        value: string | null,
        validation: Validation<TextPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();

    type NumberPluginObject = Prettify<PluginObject<NumberPlugin>>;
    expectTypeOf<NumberPluginObject>().toEqualTypeOf<{
      emptyValue?: null;
      parse: (value: string) => number | null;
      serialize: (value: number | null) => string;
      validate?: (
        value: number | null,
        validation: Validation<NumberPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();

    type CheckPluginObject = Prettify<PluginObject<CheckPlugin>>;
    expectTypeOf<CheckPluginObject>().toEqualTypeOf<{
      emptyValue: false;
      parse?: (value: CheckValue) => CheckValue;
      serialize?: (value: CheckValue) => CheckValue;
      validate?: (
        value: CheckValue,
        validation: Validation<CheckPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();
  });
});
