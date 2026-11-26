import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createWhen } from './proto.ts';

const env = createWhen({
  values: {
    INTEGRATION: { value: 'live', schema: z.enum(['live', 'mock']) },
    API_KEY: { value: 'k', schema: z.string().optional() },
    PLAIN: 'x',
  },
  when: {
    INTEGRATION: { live: { API_KEY: z.string().startsWith('sk_') } },
  },
});

expectTypeOf(env.INTEGRATION).toEqualTypeOf<'live' | 'mock'>();
expectTypeOf(env.PLAIN).toEqualTypeOf<string>();
if (env.INTEGRATION === 'live') expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
else expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();

const { INTEGRATION, API_KEY } = env;
if (INTEGRATION === 'live') expectTypeOf(API_KEY).toEqualTypeOf<string>();

// errors
createWhen({
  values: { I: { value: 'a', schema: z.enum(['a', 'b']) }, K: 'x' },
  // @ts-expect-error unknown variant
  when: { I: { c: { K: z.string() } } },
});
createWhen({
  values: { I: { value: 'a', schema: z.enum(['a', 'b']) }, K: 'x' },
  // @ts-expect-error unknown override key
  when: { I: { a: { NOPE: z.string() } } },
});
