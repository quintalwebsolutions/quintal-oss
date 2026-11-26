import type { ZodType, z } from 'zod';
import type { EnvValues, Flat, Out } from '../proto.ts';

// split a union member on discriminator D into one member per value of D
type Split<S, D extends keyof S> = S extends unknown
  ? S[D] extends infer U
    ? U extends string
      ? Flat<Omit<S, D> & { [K in D]: U }>
      : never
    : never
  : never;

type Narrow<S, D extends keyof S, V> = Extract<Split<S, D>, { [K in D]: V }>;

type Override<M, O> = Flat<
  Omit<M, keyof O> & { [K in keyof O]: O[K] extends ZodType ? z.output<O[K]> : never }
>;

type Apply<S, D extends keyof S, V, O> = Split<S, D> extends infer M
  ? M extends { [K in D]: V }
    ? Override<M, O>
    : M
  : never;

export interface Builder<S> {
  when<
    D extends keyof S & string,
    V extends Extract<S[D], string>,
    O extends { [K in Exclude<keyof S, D>]?: ZodType },
  >(
    discriminator: D,
    value: V,
    overrides: O | ((env: Narrow<S, D, V>) => O),
  ): Builder<Apply<S, D, V, O>>;
  create(): S;
}

export declare function define<T extends EnvValues>(opts: { values: T }): Builder<Out<T>>;
