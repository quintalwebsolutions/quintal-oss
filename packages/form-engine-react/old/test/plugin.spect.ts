import { it, describe, expectTypeOf } from 'vitest';
import type {
  CheckPlugin,
  NumberPlugin,
  NumberValidation,
  Plugin,
  PluginObject,
  StringValidation,
  TextPlugin,
  Validation,
  Values,
} from '../src';
import type { MaybePromise } from '../src/lib/util';
import type { SelectPlugin } from '../src/plugins/selectPlugin';

describe('plugin', () => {
  it('Allows the user to create a plugin with an internal value type, and optionally the serialized value type and empty type', () => {
    type Arbitrary = 'arbitrary';
    type ArbitraryPlugin = Plugin<Arbitrary>;
    expectTypeOf<ArbitraryPlugin>().toEqualTypeOf<{
      internalValue: Arbitrary;
      serializedValue: Arbitrary;
      emptyValue: null;
      validation: Record<string, never>;
      options: Record<string, never>;
      internalOptions: Record<string, never>;
    }>();

    expectTypeOf<TextPlugin>().toEqualTypeOf<{
      internalValue: string;
      serializedValue: string;
      emptyValue: null;
      validation: StringValidation;
      options: { placeholder?: string | undefined };
      internalOptions: Record<string, never>;
    }>();

    expectTypeOf<NumberPlugin>().toEqualTypeOf<{
      internalValue: number;
      serializedValue: string;
      emptyValue: null;
      validation: NumberValidation;
      options: { placeholder?: string | undefined };
      internalOptions: Record<string, never>;
    }>();

    type CheckValue = boolean | 'indeterminate';
    expectTypeOf<CheckPlugin>().toEqualTypeOf<{
      internalValue: CheckValue;
      serializedValue: CheckValue;
      emptyValue: false;
      validation: Record<string, never>;
      options: Record<string, never>;
      internalOptions: Record<string, never>;
    }>();

    expectTypeOf<SelectPlugin>().toEqualTypeOf<{
      internalValue: string;
      serializedValue: string;
      emptyValue: null;
      validation: Record<string, never>;
      options: { placeholder?: string | undefined };
      internalOptions: { options: { value: string; label?: string }[] };
    }>();

    type ArbitraryPluginObject = PluginObject<ArbitraryPlugin>;
    expectTypeOf<ArbitraryPluginObject>().toEqualTypeOf<{
      emptyValue?: null;
      parse?: (value: Arbitrary) => Arbitrary | null;
      serialize: (value: Arbitrary | null) => Arbitrary;
      validate?: (
        value: Arbitrary | null,
        validation: Validation<ArbitraryPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();

    type TextPluginObject = PluginObject<TextPlugin>;
    expectTypeOf<TextPluginObject>().toEqualTypeOf<{
      emptyValue?: null;
      parse?: (value: string) => string | null;
      serialize: (value: string | null) => string;
      validate?: (
        value: string | null,
        validation: Validation<TextPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();

    type NumberPluginObject = PluginObject<NumberPlugin>;
    expectTypeOf<NumberPluginObject>().toEqualTypeOf<{
      emptyValue?: null;
      parse: (value: string) => number | null;
      serialize: (value: number | null) => string;
      validate?: (
        value: number | null,
        validation: Validation<NumberPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();

    type CheckPluginObject = PluginObject<CheckPlugin>;
    expectTypeOf<CheckPluginObject>().toEqualTypeOf<{
      emptyValue: false;
      parse?: (value: CheckValue) => CheckValue;
      serialize?: (value: CheckValue) => CheckValue;
      validate?: (
        value: CheckValue,
        validation: Validation<CheckPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();

    type SelectPluginObject = PluginObject<SelectPlugin>;
    expectTypeOf<SelectPluginObject>().toEqualTypeOf<{
      emptyValue?: null;
      parse?: (value: string) => string | null;
      serialize: (value: string | null) => string;
      validate?: (
        value: string | null,
        validation: Validation<SelectPlugin, Values>,
      ) => MaybePromise<string[]>;
    }>();
  });
});
