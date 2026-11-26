import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { create } from './proto.ts';

const env = create({
  values: {
    INTEGRATION: { value: 'live', schema: z.enum(['live', 'mock']) },
    PLAIN: 'x',
    group: { A: { value: 'a', schema: z.coerce.number() } },
  },
  derived: {
    API_KEY: {
      value: 'k',
      schema: (e) => {
        expectTypeOf(e.INTEGRATION).toEqualTypeOf<'live' | 'mock'>();
        expectTypeOf(e.PLAIN).toEqualTypeOf<string>();
        expectTypeOf(e.group.A).toEqualTypeOf<number>();
        // @ts-expect-error derived entries are not in env
        e.API_KEY;
        return e.INTEGRATION === 'live' ? z.string().startsWith('sk_') : z.string().optional();
      },
    },
  },
});
expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
expectTypeOf(env.INTEGRATION).toEqualTypeOf<'live' | 'mock'>();
expectTypeOf(env.group.A).toEqualTypeOf<number>();
