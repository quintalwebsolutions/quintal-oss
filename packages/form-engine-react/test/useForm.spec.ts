import { renderHook } from '@testing-library/react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import type {
  ButtonProps,
  FormProps,
  Optional,
  Many,
  UnwrapValue,
  Value,
  TextPluginValue,
  PluginFromValue,
  TextPlugin,
  RuntimePlugin,
  NumberPluginValue,
} from '../src';
import { textPlugin, numberPlugin, useForm } from '../src';

type Ser = 'serialized';
type Opt = 'optional';
type Both = Ser | Opt;
type Int = 'internal';
type Emp = 'empty';

type Str = Value<string>;
type Num = Value<number, { serialized: string }>;
type Bol = Value<boolean, { empty: false }>;
type Arb = Value<Int, { serialized: Ser; empty: Emp }>;

type Obj = { option1: Str; option2: Arb };
type ObjI = { option1: string; option2: 'internal' };
type ObjS = { option1: string; option2: 'serialized' };

describe('useForm', () => {
  it('handles basic events that can be configured', () => {
    type Values = {
      string: TextPluginValue;
      number: NumberPluginValue;
    };

    const handleChange = vi.fn();
    const handleBlur = vi.fn();

    const { result } = renderHook(() =>
      useForm<Values>({
        fields: {
          string: textPlugin<Values>({}),
          number: numberPlugin<Values>({}),
        },
        onChange: ({ fieldName, targetValue, fieldIndex }) => {
          expect(fieldName).toBe('string');
          expect(targetValue).toBe('hello world');
          expect(fieldIndex).toBeUndefined();

          expectTypeOf(targetValue).toEqualTypeOf<unknown>();
          handleChange();
        },
        onBlur: ({ fieldName, fieldIndex }) => {
          expect(fieldName).toBe('string');
          expect(fieldIndex).toBeUndefined();
          handleBlur();
        },
      }),
    );
  });

  it('provides a type-safe, declarative input-output structure for defining forms', () => {
    type Values = {
      requiredString: string;
      requiredNumber: number;
      requiredBoolean: boolean;
      requiredNested: ObjI;

      requiredStringValue: Str;
      requiredNumberValue: Num;
      requiredBooleanValue: Bol;
      requiredArbitraryValue: Arb;
      requiredNestedValue: Obj;

      optionalString: Optional<Str>;
      optionalNumber: Optional<Num>;
      optionalBoolean: Optional<Bol>;
      optionalArbitrary: Optional<Arb>;
      optionalNested: Optional<Obj>;

      manyString: Many<Str>;
      manyNumber: Many<Num>;
      manyBoolean: Many<Bol>;
      manyArbitrary: Many<Arb>;
      manyNested: Many<Obj>;
    };

    expectTypeOf<UnwrapValue<Values>>().toEqualTypeOf<{
      requiredString: string;
      requiredNumber: number;
      requiredBoolean: boolean;
      requiredNested: ObjI;

      requiredStringValue: string;
      requiredNumberValue: number;
      requiredBooleanValue: boolean;
      requiredArbitraryValue: 'internal';
      requiredNestedValue: ObjI;

      optionalString: string | null;
      optionalNumber: number | null;
      optionalBoolean: boolean;
      optionalArbitrary: 'internal' | 'empty';
      optionalNested: ObjI | null;

      manyString: string[];
      manyNumber: number[];
      manyBoolean: boolean[];
      manyArbitrary: 'internal'[];
      manyNested: ObjI[];
    }>();

    expectTypeOf<UnwrapValue<Values, 'serialized'>>().toEqualTypeOf<{
      requiredString: string;
      requiredNumber: number;
      requiredBoolean: boolean;
      requiredNested: ObjI;

      requiredStringValue: string;
      requiredNumberValue: string;
      requiredBooleanValue: boolean;
      requiredArbitraryValue: 'serialized';
      requiredNestedValue: ObjS;

      optionalString: string;
      optionalNumber: string;
      optionalBoolean: boolean;
      optionalArbitrary: 'serialized';
      optionalNested: ObjS;

      manyString: string;
      manyNumber: string;
      manyBoolean: boolean;
      manyArbitrary: 'serialized';
      manyNested: ObjS;
    }>();

    const { result } = renderHook(() =>
      useForm<Values>({
        fields: {
          requiredString: textPlugin<Values>({}),
          // @ts-expect-error number plugin does not fit with raw number because it serializes to string
          requiredNumber: numberPlugin<Values>({}),

          requiredStringValue: textPlugin<Values>({}),
          requiredNumberValue: numberPlugin<Values>({}),

          // TODO add other plugins
        },
      }),
    );

    expectTypeOf(result.current).toEqualTypeOf<{
      form: FormProps;
      submitButton: ButtonProps;
      resetButton: ButtonProps;
    }>();
  });
});
