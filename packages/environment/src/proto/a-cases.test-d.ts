import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { create } from './a-cases.ts';

const env = create({
  values: {
    PLAIN: 'x',
    INTEGRATION: {
      value: 'live',
      schema: z.enum(['live', 'mock']),
      cases: {
        live: {
          API_KEY: { value: 'k', schema: z.string().startsWith('sk_') },
          WEBHOOK: { value: 'u', schema: z.url() },
        },
        mock: {
          API_KEY: { value: 'k', schema: z.string().optional() },
        },
      },
    },
  },
});

expectTypeOf(env).toEqualTypeOf<
  | { PLAIN: string; INTEGRATION: 'live'; API_KEY: string; WEBHOOK: string }
  | { PLAIN: string; INTEGRATION: 'mock'; API_KEY: string | undefined }
>();
if (env.INTEGRATION === 'live') expectTypeOf(env.WEBHOOK).toEqualTypeOf<string>();
// @ts-expect-error WEBHOOK only exists in live
else env.WEBHOOK;

create({
  values: {
    I: {
      value: 'a',
      schema: z.enum(['a', 'b']),
      // @ts-expect-error unknown variant
      cases: { c: { K: 'x' } },
    },
  },
});
