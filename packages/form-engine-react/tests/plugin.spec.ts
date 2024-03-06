import { describe, expectTypeOf, it } from 'vitest';
import type { CheckPlugin, NumberPlugin, PluginObject, TextPlugin } from '../src';

describe('plugin', () => {
  it('Allows the user to create a plugin with an internal value type, and optionally the serialized value type and empty type', () => {
    expectTypeOf<TextPlugin>().toEqualTypeOf<{
      internalValue: string;
      serializedValue: string;
      emptyValue: null;
    }>();

    expectTypeOf<NumberPlugin>().toEqualTypeOf<{
      internalValue: number;
      serializedValue: string;
      emptyValue: null;
    }>();

    type CheckValue = boolean | 'indeterminate';
    expectTypeOf<CheckPlugin>().toEqualTypeOf<{
      internalValue: CheckValue;
      serializedValue: CheckValue;
      emptyValue: false;
    }>();

    type TextPluginObject = PluginObject<TextPlugin>;
    expectTypeOf<TextPluginObject>().toEqualTypeOf<
      {
        defaultInitialValue?: string | null;
      } & {
        parse?: (value: string) => string | null;
      } & {
        serialize: (value: string | null) => string;
      }
    >();

    type NumberPluginObject = PluginObject<NumberPlugin>;
    expectTypeOf<NumberPluginObject>().toEqualTypeOf<
      {
        defaultInitialValue?: number | null;
      } & {
        parse: (value: string) => number | null;
      } & {
        serialize: (value: number | null) => string;
      }
    >();

    type CheckPluginObject = PluginObject<CheckPlugin>;
    expectTypeOf<CheckPluginObject>().toEqualTypeOf<
      {
        defaultInitialValue: CheckValue;
      } & {
        parse?: (value: CheckValue) => CheckValue;
      } & {
        serialize?: (value: CheckValue) => CheckValue;
      }
    >();
  });
});
