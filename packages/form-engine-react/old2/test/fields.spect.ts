import { describe, it } from 'vitest';
import type { DefineFields, Many, Optional } from '../src/lib';
import type { TextInputPlugin } from '../src/plugins';

describe('fields', () => {
  it('provides a way to define complex field structures in the type system', () => {
    // @ts-expect-error No literal type
    type _NoLiteralType = DefineFields<{
      noLiteralType: string;
    }>;

    // @ts-expect-error No nested literal type
    type _NoNestedLiteralType = DefineFields<{
      nested: { noNestedLiteralType: string };
    }>;

    // @ts-expect-error No nested literal type
    type _NoDoubleMany = DefineFields<{
      noDoubleMany: Many<Many<TextInputPlugin>>;
    }>;

    // @ts-expect-error No nested literal type
    type _NoDoubleOptional = DefineFields<{
      noDoubleMany: Optional<Optional<TextInputPlugin>>;
    }>;

    // @ts-expect-error No nested literal type
    type _NoOptionalNested = DefineFields<{
      noOptionalNested: Optional<{ nested: TextInputPlugin }>;
    }>;

    // TODO test how this type is handled by the type system
    type _CorrectUsage = DefineFields<{
      requiredText: TextInputPlugin;
      optionalText: Optional<TextInputPlugin>;
      manyText: Many<TextInputPlugin>;
      optionalManyText: Optional<Many<TextInputPlugin>>;
      manyOptionalText: Many<Optional<TextInputPlugin>>;
      optionalManyOptionalText: Optional<Many<Optional<TextInputPlugin>>>;
      nested: { level1: TextInputPlugin };
      doubleNested: {
        nestedProperty: TextInputPlugin;
        level1: { level2: TextInputPlugin };
      };
      manyNested: Many<{ nested: TextInputPlugin }>;
      complexNested: Many<{
        prop: TextInputPlugin;
        level1Many: Many<{ level2: TextInputPlugin }>;
        level1: { level2: TextInputPlugin };
      }>;
    }>;
  });
});
