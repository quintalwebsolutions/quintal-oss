import { describe, expect, expectTypeOf, it } from 'vitest';
import { type AnyOption, type Option, none, some } from '../src';
import type { Equal } from './util';

function expectOptionUnwrap<TOption extends AnyOption>(_option: TOption) {
  return {
    // biome-ignore lint/suspicious/noEmptyBlockStatements: test
    toBe: <TUnwrap>(_val: Equal<ReturnType<TOption['unwrap']>, TUnwrap>) => {},
  };
}

const someValue = some('value' as const);
const noneValue = none;
// const earlySome = some('early' as const);
// const lateSome = some('late' as const);
const someOption1 = some('value1' as const) as Option<'value1'>;
// const someOption2 = some('value2' as const) as Option<'value2'>;
const noneOption1 = none as Option<'none1'>;
// const noneOption2 = none as Option<'none2'>;

describe('Option', () => {
  it('Is able to create type-save `some` and `none` values', () => {
    expectTypeOf(someValue.isSome).toEqualTypeOf<true>();
    expect(someValue.isSome).toBe(true);
    expectTypeOf(someValue.isNone).toEqualTypeOf<false>();
    expect(someValue.isNone).toBe(false);

    expectTypeOf(noneValue.isSome).toEqualTypeOf<false>();
    expect(noneValue.isSome).toBe(false);
    expectTypeOf(noneValue.isNone).toEqualTypeOf<true>();
    expect(noneValue.isNone).toBe(true);

    expectTypeOf(someOption1.isSome).toEqualTypeOf<boolean>();
    expect(someOption1.isSome).toBe(true);
    expectTypeOf(someOption1.isNone).toEqualTypeOf<boolean>();
    expect(someOption1.isNone).toBe(false);

    expectTypeOf(noneOption1.isSome).toEqualTypeOf<boolean>();
    expect(noneOption1.isSome).toBe(false);
    expectTypeOf(noneOption1.isNone).toEqualTypeOf<boolean>();
    expect(noneOption1.isNone).toBe(true);
  });

  it('Allows to type-narrow a generic type', () => {
    expectOptionUnwrap(someOption1).toBe<'value1'>(true);
    if (someOption1.isSome) {
      expectOptionUnwrap(someOption1).toBe<'value1'>(true);
    } else {
      expectOptionUnwrap(someOption1).toBe<never>(true);
    }
  });

  it('Allows to unwrap the option value with a custom error message', async () => {
    expect(someValue.expect('Should be some')).toBe('value');
    expect(() => noneValue.expect('Should be some')).toThrow('Should be some');
    expect(someOption1.expect('Should be some')).toBe('value1');
    expect(() => noneOption1.expect('Should be some')).toThrow('Should be some');
  });

  it('Allows to unwrap the option value', () => {
    expectOptionUnwrap(someValue).toBe<'value'>(true);
    expect(someValue.unwrap()).toBe('value');

    expectOptionUnwrap(noneValue).toBe<never>(true);
    expect(noneValue.unwrap).toThrow("Attempted to unwrap a 'none' value");

    expectOptionUnwrap(someOption1).toBe<'value1'>(true);
    expect(someOption1.unwrap()).toBe('value1');

    expectOptionUnwrap(noneOption1).toBe<'none1'>(true);
    expect(noneOption1.unwrap).toThrow("Attempted to unwrap a 'none' value");
  });
});
