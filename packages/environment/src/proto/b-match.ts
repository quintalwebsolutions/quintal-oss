import { type ZodType, z } from 'zod';
import type { EnvValue, EnvValues, Flat, Out, Unwrap } from '../proto.ts';

declare const matched: unique symbol;
type Equals<A, B> = (<X>() => X extends A ? 1 : 2) extends <X>() => X extends B ? 1 : 2
  ? true
  : false;

// schema type that remembers which variable it depends on and the per-value schemas
type Matched<D, M> = M[keyof M] & { readonly [matched]: { d: D; m: M } };

export interface Variable<S extends ZodType> {
  value: string | undefined;
  schema: S;
  isServerOnly?: boolean;
  /** Pick the schema for the current value of this variable (exhaustive). */
  match<M extends { [V in Extract<z.output<S>, string>]: ZodType }>(
    map: M & { [V in keyof M]: V extends Extract<z.output<S>, string> ? M[V] : never },
  ): Matched<Variable<S>, M>;
}

export function variable<S extends ZodType>(def: {
  value: string | undefined;
  schema: S;
  isServerOnly?: boolean;
}): Variable<S> {
  return {
    ...def,
    match(map) {
      // ponytail: evaluated eagerly; invalid discriminator -> z.unknown(), it reports its own error
      const r = def.schema.safeParse(def.value || undefined);
      return (r.success ? (map as Record<string, ZodType>)[r.data as string] : z.unknown()) as never;
    },
  };
}

type BrandOf<E> = E extends { schema: { readonly [matched]: infer B } } ? B : never;
type DepKeys<T> = { [K in keyof T]: [BrandOf<T[K]>] extends [never] ? never : K }[keyof T];
type DiscKey<T, D> = { [K in keyof T]: Equals<T[K], D> extends true ? K : never }[keyof T];

type Result<T> = [DepKeys<T>] extends [never]
  ? Out<T>
  : BrandOf<T[DepKeys<T>]> extends { d: infer D }
    ? DiscKey<T, D> extends infer DK extends keyof T
      ? Extract<Unwrap<T[DK]>, string> extends infer V
        ? V extends string
          ? Flat<
              Out<Omit<T, DK | DepKeys<T>>> & { [K in DK]: V } & {
                [K in DepKeys<T>]: BrandOf<T[K]> extends { m: infer M }
                  ? V extends keyof M
                    ? M[V] extends ZodType
                      ? z.output<M[V]>
                      : never
                    : never
                  : never;
              }
            >
          : never
        : never
      : never
    : never;

export declare function create<T extends EnvValues>(opts: { values: T }): Result<T>;
export type { EnvValue };
