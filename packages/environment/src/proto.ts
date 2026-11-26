import type { ZodType, z } from 'zod';

// biome-ignore lint/complexity/noBannedTypes: no call signature, so contextual typing comes from Values<T> only
type SchemaFn = Function;

export type EnvValue = {
  value: string | undefined;
  schema?: ZodType | SchemaFn;
  isServerOnly?: boolean;
};
export type EnvValues = { [key: string]: EnvValue | EnvValues | string | undefined };

// entry whose schema is a function
type IsDerived<V> = V extends { schema: (...args: never[]) => unknown } ? true : false;

export type Unwrap<V> = V extends string
  ? string
  : V extends EnvValue
    ? V extends { schema: infer S }
      ? S extends (...args: never[]) => infer R
        ? R extends ZodType
          ? z.output<R>
          : never
        : S extends ZodType
          ? z.output<S>
          : string
      : string
    : V extends Record<string, unknown>
      ? { [K in keyof V]: Unwrap<V[K]> }
      : never;

// pass-1 env: everything except function-schema entries
export type StaticEnv<T> = {
  [K in keyof T as T[K] extends string | undefined
    ? K
    : IsDerived<T[K]> extends true
      ? never
      : K]: T[K] extends EnvValue ? Unwrap<T[K]> : T[K] extends string | undefined ? string : StaticEnv<T[K]>;
};

type DerivedEntry<TEnv> = {
  value: string | undefined;
  schema: (env: TEnv) => ZodType;
  isServerOnly?: boolean;
};

export declare function create<
  const T extends EnvValues,
  D extends { [key: string]: { schema: (...args: never[]) => ZodType } } = {},
>(opts: {
  values: T;
  derived?: D & { [key: string]: DerivedEntry<StaticEnv<T>> };
}): { [K in keyof T]: Unwrap<T[K]> } & { [K in keyof D]: z.output<ReturnType<D[K]['schema']>> };

// ---- `when`: discriminated-union output ----
export type Out<T> = { -readonly [K in keyof T]: Unwrap<T[K]> };
export type Flat<T> = { -readonly [K in keyof T]: T[K] } & unknown;

type When<T> = {
  [D in keyof T]?: {
    [V in Extract<Unwrap<T[D]>, string>]?: { [K in Exclude<keyof T, D>]?: ZodType };
  };
};

type Variant<T, D extends keyof T, V, TOverride> = Flat<
  Omit<Out<T>, D | keyof TOverride> & { [K in D]: V } & {
    [K in keyof TOverride]: TOverride[K] extends ZodType ? z.output<TOverride[K]> : never;
  }
>;

type WhenOut<T, W> = [keyof W & keyof T] extends [never]
  ? Out<T>
  : {
      [D in keyof W & keyof T]: Extract<Unwrap<T[D]>, string> extends infer V
        ? V extends string
          ? Variant<T, D, V, W[D] extends Record<V, infer O> ? O : unknown>
          : never
        : never;
    }[keyof W & keyof T];

export declare function createWhen<const T extends EnvValues, const W extends When<T> = {}>(opts: {
  values: T;
  when?: W & When<T>;
}): WhenOut<T, W>;
