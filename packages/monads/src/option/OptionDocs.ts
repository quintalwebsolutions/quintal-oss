import type { OptionTernary, ValueFromSome } from './types';

type OptionVariant = 'some' | 'none' | 'async';

type EvaluateOptionVariant<
  TVariant extends OptionVariant,
  TMap extends Record<OptionVariant, unknown>,
> = TMap[TVariant];

// type OptionValue<TValue, TVariant extends Variant> = EvaluateVariant<
//   TVariant,
//   { some: TValue; none: never; async: ValueFromSome<TValue> }
// >;

/** A data structure that represents either the presence or the absence of a value */
export type OptionDocs<TValue, TVariant extends OptionVariant> = {
  // TODO regions
  // TODO docs
  isSome: EvaluateOptionVariant<
    TVariant,
    { some: true; none: false; async: Promise<OptionTernary<TValue, true, false>> }
  >;
  isNone: EvaluateOptionVariant<
    TVariant,
    { some: false; none: true; async: Promise<OptionTernary<TValue, false, true>> }
  >;
  unwrap: () => EvaluateOptionVariant<
    OptionVariant,
    { some: TValue; none: never; async: Promise<ValueFromSome<TValue>> }
  >;
};
