import type { ComponentProps } from 'react';
import { describe, expectTypeOf, it } from 'vitest';
import type { Plugin, PluginConfig, TextInputPlugin } from '../src';

describe('plugin', () => {
  it('exposes a suite of built-in plugins', () => {
    expectTypeOf<TextInputPlugin>().toMatchTypeOf<{
      value: string;
      emptyValue: null;
      // validation: StringValidation;
      validation: any;
      options: {
        placeholder?: string;
      };
      props: {
        input: ComponentProps<'input'>;
        label: ComponentProps<'label'>;
      };
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

  it('allows the user to define a custom plugin with sensible defaults', () => {
    type Arbitrary = 'arbitrary';
    type ArbitraryPlugin = Plugin<Arbitrary>;
    type ArbitraryPluginConfig = PluginConfig<ArbitraryPlugin>;

    expectTypeOf<ArbitraryPlugin>().toEqualTypeOf<{
      value: 'arbitrary';
      emptyValue: null;
      validation: Record<string, never>;
      options: Record<string, never>;
      props: Record<string, never>;
    }>();

    expectTypeOf<ArbitraryPluginConfig>().toEqualTypeOf<{
      emptyValue?: null;
      getProps?: (fieldState, actions) => Record<string, never>;
    }>();
  });
});
