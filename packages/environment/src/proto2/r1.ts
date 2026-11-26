import { type ZodType, z } from 'zod';
import type { ZodError } from 'zod';
import { type Group, type Leaf, run } from './core.ts';

// ---------- input types (today's shape + `cases`) ----------
type EntryObj = {
  value: string | undefined;
  schema?: ZodType;
  isServerOnly?: boolean;
  cases?: { [variant: string]: Values };
};
type Values = { [key: string]: EntryObj | Values | string | undefined };

// ---------- output types ----------
type Flat<T> = { -readonly [K in keyof T]: T[K] } & unknown;
type IsUnion<T, U = T> = [T] extends [never] ? false : T extends unknown ? ([U] extends [T] ? false : true) : never;

type LeafOut<V> = V extends { schema: infer S extends ZodType } ? z.output<S> : string;
type CaseKey<T> = { [K in keyof T]: T[K] extends { cases: object } ? K : never }[keyof T];
type CasesOf<E> = E extends { cases: infer C } ? C : never;

type NodeOut<V> = V extends string | undefined
  ? string
  : V extends { value: unknown }
    ? LeafOut<V>
    : Res<V>;

type Variants<T, D extends keyof T> = Extract<LeafOut<T[D]>, string> extends infer V
  ? V extends string
    ? Flat<{ [K in D]: V } & (V extends keyof CasesOf<T[D]> ? Res<CasesOf<T[D]>[V]> : unknown)>
    : never
  : never;

type Res<T> = [CaseKey<T>] extends [never]
  ? Flat<{ [K in keyof T]: NodeOut<T[K]> }>
  : Flat<{ [K in Exclude<keyof T, CaseKey<T>>]: NodeOut<T[K]> } & Variants<T, CaseKey<T>>>;

// ---------- typo / misuse guard ----------
type Allowed<E> = E extends { schema: infer S extends ZodType } ? Extract<z.output<S>, string> : never;
type Check<T> = {
  [K in keyof T]: T[K] extends string | undefined
    ? unknown
    : T[K] extends { value: unknown }
      ? T[K] extends { cases: infer C }
        ? {
            cases: IsUnion<CaseKey<T>> extends true
              ? never // only one discriminator per group
              : { [V in keyof C]: V extends Allowed<T[K]> ? C[V] & Check<C[V]> : never };
          }
        : unknown
      : Check<T[K]>;
};

// ---------- runtime front-end ----------
function normalize(values: Record<string, unknown>): Group {
  return Object.fromEntries(
    Object.entries(values).map(([k, n]) => {
      if (typeof n === 'string' || n === undefined)
        return [k, { kind: 'leaf', value: n, schema: z.string(), server: false } satisfies Leaf];
      const o = n as EntryObj;
      if ('value' in o)
        return [
          k,
          {
            kind: 'leaf',
            value: o.value,
            schema: o.schema ?? z.string(),
            server: o.isServerOnly ?? false,
            cases:
              o.cases &&
              Object.fromEntries(Object.entries(o.cases).map(([v, c]) => [v, normalize(c)])),
          } satisfies Leaf,
        ];
      return [k, normalize(o as Record<string, unknown>)];
    }),
  );
}

export function createEnvironment<T extends Values>(opts: {
  isDisabled?: boolean;
  isServer?: boolean;
  onValidationError?: (error: ZodError) => never;
  onAccessError?: (variableName: string) => never;
  values: T & Check<T>;
}): Res<T> {
  return run(normalize(opts.values), opts) as Res<T>;
}
