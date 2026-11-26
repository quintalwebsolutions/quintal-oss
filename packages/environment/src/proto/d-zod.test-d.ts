import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { create } from './d-zod.ts';

const env = create({
  values: {
    PLAIN: 'x',
    INTEGRATION: { value: 'live' },
    API_KEY: { value: 'k' },
  },
  schema: z.discriminatedUnion('INTEGRATION', [
    z.object({ INTEGRATION: z.literal('live'), API_KEY: z.string().startsWith('sk_') }),
    z.object({ INTEGRATION: z.literal('mock'), API_KEY: z.string().optional() }),
  ]),
});

expectTypeOf(env).toEqualTypeOf<
  | { PLAIN: string; INTEGRATION: 'live'; API_KEY: string }
  | { PLAIN: string; INTEGRATION: 'mock'; API_KEY?: string | undefined }
>();
if (env.INTEGRATION === 'live') expectTypeOf(env.API_KEY).toEqualTypeOf<string>();

create({
  values: { A: { value: 'x' } },
  // @ts-expect-error schema mentions a key that has no raw value
  schema: z.object({ A: z.string(), NOPE: z.string() }),
});
