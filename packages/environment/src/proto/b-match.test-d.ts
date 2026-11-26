import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { create, variable } from './b-match.ts';

const integration = variable({ value: 'live', schema: z.enum(['live', 'mock']) });

const env = create({
  values: {
    PLAIN: 'x',
    INTEGRATION: integration,
    API_KEY: {
      value: 'k',
      schema: integration.match({ live: z.string().startsWith('sk_'), mock: z.string().optional() }),
    },
  },
});

expectTypeOf(env).toEqualTypeOf<
  | { PLAIN: string; INTEGRATION: 'live'; API_KEY: string }
  | { PLAIN: string; INTEGRATION: 'mock'; API_KEY: string | undefined }
>();
if (env.INTEGRATION === 'live') expectTypeOf(env.API_KEY).toEqualTypeOf<string>();

// @ts-expect-error missing variant 'mock'
integration.match({ live: z.string() });
// @ts-expect-error unknown variant
integration.match({ live: z.string(), mock: z.string(), nope: z.string() });
