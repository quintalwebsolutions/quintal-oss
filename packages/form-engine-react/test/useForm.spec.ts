import { describe, expectTypeOf, it } from 'vitest';
import type { Optional, Many, UnwrapValue, Value, UnwrapValues } from '../src';

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
  it('provides a type-safe way to handle possibly empty or many values internally and externally', () => {
    expectTypeOf<Str>().toEqualTypeOf<{
      __internal__: string;
      __serialized__: string;
      __empty__: null;
    }>();
    expectTypeOf<Num>().toEqualTypeOf<{
      __internal__: number;
      __serialized__: string;
      __empty__: null;
    }>();
    expectTypeOf<Bol>().toEqualTypeOf<{
      __internal__: boolean;
      __serialized__: boolean;
      __empty__: false;
    }>();
    expectTypeOf<Arb>().toEqualTypeOf<{
      __internal__: 'internal';
      __serialized__: 'serialized';
      __empty__: 'empty';
    }>();
    expectTypeOf<Obj>().toEqualTypeOf<{
      option1: {
        __internal__: string;
        __serialized__: string;
        __empty__: null;
      };
      option2: {
        __internal__: 'internal';
        __serialized__: 'serialized';
        __empty__: 'empty';
      };
    }>();

    expectTypeOf<UnwrapValue<string>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<string, Ser>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<string, Opt>>().toEqualTypeOf<string | null>();
    expectTypeOf<UnwrapValue<string, Both>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<number>>().toEqualTypeOf<number>();
    expectTypeOf<UnwrapValue<number, Ser>>().toEqualTypeOf<number>();
    expectTypeOf<UnwrapValue<number, Opt>>().toEqualTypeOf<number | null>();
    expectTypeOf<UnwrapValue<number, Both>>().toEqualTypeOf<number>();
    expectTypeOf<UnwrapValue<boolean>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<boolean, Ser>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<boolean, Opt>>().toEqualTypeOf<boolean | null>();
    expectTypeOf<UnwrapValue<boolean, Both>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<ObjI>>().toEqualTypeOf<ObjI>();
    expectTypeOf<UnwrapValue<ObjI, Ser>>().toEqualTypeOf<ObjI>();
    expectTypeOf<UnwrapValue<ObjI, Opt>>().toEqualTypeOf<ObjI | null>();
    expectTypeOf<UnwrapValue<ObjI, Both>>().toEqualTypeOf<ObjI>();

    expectTypeOf<UnwrapValue<Str>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<Str, Ser>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<Str, Opt>>().toEqualTypeOf<string | null>();
    expectTypeOf<UnwrapValue<Str, Both>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<Num>>().toEqualTypeOf<number>();
    expectTypeOf<UnwrapValue<Num, Ser>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<Num, Opt>>().toEqualTypeOf<number | null>();
    expectTypeOf<UnwrapValue<Num, Both>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<Bol>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<Bol, Ser>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<Bol, Opt>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<Bol, Both>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<Arb>>().toEqualTypeOf<Int>();
    expectTypeOf<UnwrapValue<Arb, Ser>>().toEqualTypeOf<Ser>();
    expectTypeOf<UnwrapValue<Arb, Opt>>().toEqualTypeOf<Int | Emp>();
    expectTypeOf<UnwrapValue<Arb, Both>>().toEqualTypeOf<Ser>();
    expectTypeOf<UnwrapValue<Obj>>().toEqualTypeOf<ObjI>();
    expectTypeOf<UnwrapValue<Obj, Ser>>().toEqualTypeOf<ObjS>();
    expectTypeOf<UnwrapValue<Obj, Opt>>().toEqualTypeOf<ObjI | null>();
    expectTypeOf<UnwrapValue<Obj, Both>>().toEqualTypeOf<ObjS>();

    type OptStr = Optional<Str>;
    expectTypeOf<UnwrapValue<OptStr>>().toEqualTypeOf<string | null>();
    expectTypeOf<UnwrapValue<OptStr, Ser>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<OptStr, Opt>>().toEqualTypeOf<string | null>();
    expectTypeOf<UnwrapValue<OptStr, Both>>().toEqualTypeOf<string>();
    type OptNum = Optional<Num>;
    expectTypeOf<UnwrapValue<OptNum>>().toEqualTypeOf<number | null>();
    expectTypeOf<UnwrapValue<OptNum, Ser>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<OptNum, Opt>>().toEqualTypeOf<number | null>();
    expectTypeOf<UnwrapValue<OptNum, Both>>().toEqualTypeOf<string>();
    type OptBol = Optional<Bol>;
    expectTypeOf<UnwrapValue<OptBol>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<OptBol, Ser>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<OptBol, Opt>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<OptBol, Both>>().toEqualTypeOf<boolean>();
    type OptArb = Optional<Arb>;
    expectTypeOf<UnwrapValue<OptArb>>().toEqualTypeOf<Int | Emp>();
    expectTypeOf<UnwrapValue<OptArb, Ser>>().toEqualTypeOf<Ser>();
    expectTypeOf<UnwrapValue<OptArb, Opt>>().toEqualTypeOf<Int | Emp>();
    expectTypeOf<UnwrapValue<OptArb, Both>>().toEqualTypeOf<Ser>();
    type OptObj = Optional<Obj>;
    expectTypeOf<UnwrapValue<OptObj>>().toEqualTypeOf<ObjI | null>();
    expectTypeOf<UnwrapValue<OptObj, Ser>>().toEqualTypeOf<ObjS>();
    expectTypeOf<UnwrapValue<OptObj, Opt>>().toEqualTypeOf<ObjI | null>();
    expectTypeOf<UnwrapValue<OptObj, Both>>().toEqualTypeOf<ObjS>();

    type ManyStr = Many<Str>;
    expectTypeOf<UnwrapValue<ManyStr>>().toEqualTypeOf<string[]>();
    expectTypeOf<UnwrapValue<ManyStr, Ser>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<ManyStr, Opt>>().toEqualTypeOf<string[] | null>();
    expectTypeOf<UnwrapValue<ManyStr, Both>>().toEqualTypeOf<string>();
    type ManyNum = Many<Num>;
    expectTypeOf<UnwrapValue<ManyNum>>().toEqualTypeOf<number[]>();
    expectTypeOf<UnwrapValue<ManyNum, Ser>>().toEqualTypeOf<string>();
    expectTypeOf<UnwrapValue<ManyNum, Opt>>().toEqualTypeOf<number[] | null>();
    expectTypeOf<UnwrapValue<ManyNum, Both>>().toEqualTypeOf<string>();
    type ManyBol = Many<Bol>;
    expectTypeOf<UnwrapValue<ManyBol>>().toEqualTypeOf<boolean[]>();
    expectTypeOf<UnwrapValue<ManyBol, Ser>>().toEqualTypeOf<boolean>();
    expectTypeOf<UnwrapValue<ManyBol, Opt>>().toEqualTypeOf<boolean[] | null>();
    expectTypeOf<UnwrapValue<ManyBol, Both>>().toEqualTypeOf<boolean>();
    type ManyArb = Many<Arb>;
    expectTypeOf<UnwrapValue<ManyArb>>().toEqualTypeOf<Int[]>();
    expectTypeOf<UnwrapValue<ManyArb, Ser>>().toEqualTypeOf<Ser>();
    expectTypeOf<UnwrapValue<ManyArb, Opt>>().toEqualTypeOf<Int[] | null>();
    expectTypeOf<UnwrapValue<ManyArb, Both>>().toEqualTypeOf<Ser>();
    type ManyObj = Many<Obj>;
    expectTypeOf<UnwrapValue<ManyObj>>().toEqualTypeOf<ObjI[]>();
    expectTypeOf<UnwrapValue<ManyObj, Ser>>().toEqualTypeOf<ObjS>();
    expectTypeOf<UnwrapValue<ManyObj, Opt>>().toEqualTypeOf<ObjI[] | null>();
    expectTypeOf<UnwrapValue<ManyObj, Both>>().toEqualTypeOf<ObjS>();

    type OptManyArb = Optional<Many<Arb>>;
    expectTypeOf<UnwrapValue<OptManyArb>>().toEqualTypeOf<Int[] | null>();
    type ManyOptArb = Many<Optional<Arb>>;
    expectTypeOf<UnwrapValue<ManyOptArb>>().toEqualTypeOf<(Int | Emp)[]>();
    type OptManyOptArb = Optional<Many<Optional<Arb>>>;
    expectTypeOf<UnwrapValue<OptManyOptArb>>().toEqualTypeOf<
      (Int | Emp)[] | null
    >();
    expectTypeOf<UnwrapValue<OptManyOptArb, Ser>>().toEqualTypeOf<Ser>();

    type DeepNested = {
      level1: { level2: Optional<Many<{ level3: Many<Optional<Arb>> }>> };
    };
    expectTypeOf<UnwrapValue<DeepNested>>().toEqualTypeOf<{
      level1: { level2: { level3: (Int | Emp)[] }[] | null };
    }>();
    expectTypeOf<UnwrapValue<DeepNested, Ser>>().toEqualTypeOf<{
      level1: { level2: { level3: Ser } };
    }>();
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

    expectTypeOf<UnwrapValues<Values>>().toEqualTypeOf<{
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

    expectTypeOf<UnwrapValues<Values, 'serialized'>>().toEqualTypeOf<{
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

    // TODO
    // const { result } = renderHook(() => useForm<Values>({}));

    // expectTypeOf(result.current).toEqualTypeOf<{
    //   form: FormProps;
    //   submitButton: ButtonProps;
    //   resetButton: ButtonProps;
    // }>();
  });
});
