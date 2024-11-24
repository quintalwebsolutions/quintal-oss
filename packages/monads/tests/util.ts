import type { Ternary } from '../src/util.ts';

// Source https://www.totaltypescript.com/how-to-test-your-types
export type Equal<TValue1, TValue2> = (<TValue>() => TValue extends TValue1 ? 1 : 2) extends <
  TValue,
>() => TValue extends TValue2 ? 1 : 2
  ? true
  : false;

export type And<TValue1 extends boolean, TValue2 extends boolean> = Ternary<
  TValue1,
  TValue2,
  false
>;

export type Or<TValue1 extends boolean, TValue2 extends boolean> = Ternary<TValue1, true, TValue2>;
