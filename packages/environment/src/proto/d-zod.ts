import type { ZodType, z } from 'zod';
import type { EnvValue, Flat, Out } from '../proto.ts';

type Raw = { value: string | undefined; isServerOnly?: boolean };
type KeysOf<O> = O extends unknown ? keyof O : never;

// every key the union talks about must be declared in `values` (so it has a raw value)
type Check<T, U extends ZodType> = [Exclude<KeysOf<z.output<U>>, keyof T>] extends [never]
  ? unknown
  : never;

export declare function create<
  T extends { [key: string]: EnvValue | Raw | string | undefined },
  U extends ZodType<{ [key: string]: unknown }>,
>(opts: {
  /** raw values for everything; entries covered by `schema` need no schema of their own */
  values: T;
  /** takes over the keys it mentions (discriminatedUnion, object, refine, ...) */
  schema: U & Check<T, U>;
}): Flat<Omit<Out<T>, KeysOf<z.output<U>>> & z.output<U>>;
