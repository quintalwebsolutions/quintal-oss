import { type ZodError, type ZodString, type ZodType, z } from 'zod';
import { type Group, type Leaf as CoreLeaf, run } from './core.ts';

declare const meta: unique symbol;
const LEAF = Symbol('leaf');

type Flat<T> = { -readonly [K in keyof T]: T[K] } & unknown;
type IsUnion<T, U = T> = [T] extends [never] ? false : T extends unknown ? ([U] extends [T] ? false : true) : never;

type Node = string | undefined | AnyLeaf | Tree;
type Tree = { [key: string]: Node };
type Variant<S extends ZodType> = Extract<z.output<S>, string>;

export interface Leaf<S extends ZodType, C = never> {
  readonly [meta]: { schema: S; cases: C };
  /** Variables that only exist (and are validated) for a given value of this variable. */
  cases<const M extends { [V in Variant<S>]?: Tree }>(
    map: M & { [V in keyof M]: V extends Variant<S> ? M[V] : never },
  ): Leaf<S, M>;
}
// biome-ignore lint/suspicious/noExplicitAny: variance escape hatch
type AnyLeaf = Leaf<ZodType, any>;

export function v(value: string | undefined, schema?: undefined, opts?: { server?: boolean }): Leaf<ZodString>;
export function v<S extends ZodType>(value: string | undefined, schema: S, opts?: { server?: boolean }): Leaf<S>;
export function v<S extends ZodType>(
  value: string | undefined,
  schema?: S,
  opts?: { server?: boolean },
): Leaf<S> {
  const make = (cases?: Record<string, Tree>): Leaf<S, never> =>
    ({
      [LEAF]: { value, schema: schema ?? z.string(), server: opts?.server ?? false, cases },
      cases: (map: Record<string, Tree>) => make(map),
    }) as never;
  return make();
}

// ---------- output ----------
type CaseKey<T> = {
  [K in keyof T]: T[K] extends Leaf<ZodType, infer C> ? ([C] extends [never] ? never : K) : never;
}[keyof T];

type NodeOut<V> = V extends string | undefined
  ? string
  : V extends Leaf<infer S, unknown>
    ? z.output<S>
    : Res<V>;

type Variants<T, D extends keyof T> = T[D] extends Leaf<infer S, infer C>
  ? Variant<S> extends infer V
    ? V extends string
      ? Flat<{ [K in D]: V } & (V extends keyof C ? Res<C[V]> : unknown)>
      : never
    : never
  : never;

type Res<T> = [CaseKey<T>] extends [never]
  ? Flat<{ [K in keyof T]: NodeOut<T[K]> }>
  : Flat<{ [K in Exclude<keyof T, CaseKey<T>>]: NodeOut<T[K]> } & Variants<T, CaseKey<T>>>;

// one discriminator per group (checked for the root and nested groups)
type Single<T> = {
  [K in keyof T]: T[K] extends string | undefined | AnyLeaf
    ? T[K] extends Leaf<ZodType, infer C>
      ? [C] extends [never]
        ? unknown
        : IsUnion<CaseKey<T>> extends true
          ? never
          : unknown
      : unknown
    : Single<T[K]>;
};

// ---------- runtime front-end ----------
function normalize(tree: Tree): Group {
  return Object.fromEntries(
    Object.entries(tree).map(([k, n]) => {
      if (typeof n === 'string' || n === undefined)
        return [k, { kind: 'leaf', value: n, schema: z.string(), server: false } satisfies CoreLeaf];
      const l = (n as unknown as { [LEAF]?: CoreLeaf & { cases?: Record<string, Tree> } })[LEAF];
      if (l)
        return [
          k,
          {
            kind: 'leaf',
            value: l.value,
            schema: l.schema,
            server: l.server,
            cases:
              l.cases &&
              Object.fromEntries(Object.entries(l.cases).map(([val, c]) => [val, normalize(c)])),
          } satisfies CoreLeaf,
        ];
      return [k, normalize(n as Tree)];
    }),
  );
}

export function createEnvironment<const T extends Tree>(
  values: T & Single<T>,
  opts?: {
    isDisabled?: boolean;
    isServer?: boolean;
    onValidationError?: (error: ZodError) => never;
    onAccessError?: (variableName: string) => never;
  },
): Res<T> {
  return run(normalize(values), opts) as Res<T>;
}
