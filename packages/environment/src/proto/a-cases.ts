import type { ZodType, z } from 'zod';
import type { EnvValue, EnvValues, Flat, Out, Unwrap } from '../proto.ts';

type Entry = EnvValue | string | undefined;

type Allowed<E> = E extends { schema: infer S extends ZodType } ? Extract<z.output<S>, string> : never;

// typo guard: case keys must be outputs of the entry's own schema, contents must be entries
type Check<T> = {
  [K in keyof T]: T[K] extends { cases: infer C }
    ? {
        cases: {
          [V in keyof C]: V extends Allowed<T[K]>
            ? C[V] extends { [key: string]: Entry }
              ? C[V]
              : never
            : never;
        };
      }
    : unknown;
};

type CaseKeys<T> = { [K in keyof T]: T[K] extends { cases: object } ? K : never }[keyof T];
type CasesOf<E> = E extends { cases: infer C } ? C : never;

type Variants<T, D extends keyof T> = Extract<Unwrap<T[D]>, string> extends infer V
  ? V extends string
    ? Flat<
        { [K in D]: V } & (V extends keyof CasesOf<T[D]> ? Out<CasesOf<T[D]>[V]> : unknown)
      >
    : never
  : never;

type Result<T> = [CaseKeys<T>] extends [never]
  ? Out<T>
  : Flat<Out<Omit<T, CaseKeys<T>>> & Variants<T, CaseKeys<T>>>;

export declare function create<T extends EnvValues>(opts: { values: T & Check<T> }): Result<T>;
