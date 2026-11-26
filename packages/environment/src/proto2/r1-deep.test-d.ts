import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createEnvironment } from './r1.ts';

const env = createEnvironment({
  values: {
    PLAIN: 'x',
    INTEGRATION: {
      value: 'live',
      schema: z.enum(['live', 'mock']),
      cases: {
        live: {
          API_KEY: { value: 'k', schema: z.string().startsWith('sk_') },
          REGION: {
            value: 'eu',
            schema: z.enum(['eu', 'us']),
            cases: {
              eu: { VAT_ID: { value: 'v', schema: z.string() } },
              us: { TAX_ID: { value: 't', schema: z.string() }, STATE: { value: 's', schema: z.string() } },
            },
          },
        },
        mock: { MOCK_DELAY: { value: '1', schema: z.coerce.number().default(0) } },
      },
    },
  },
});

expectTypeOf(env).toEqualTypeOf<
  | { PLAIN: string; INTEGRATION: 'live'; API_KEY: string; REGION: 'eu'; VAT_ID: string }
  | { PLAIN: string; INTEGRATION: 'live'; API_KEY: string; REGION: 'us'; TAX_ID: string; STATE: string }
  | { PLAIN: string; INTEGRATION: 'mock'; MOCK_DELAY: number }
>();

if (env.INTEGRATION === 'live') {
  expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
  if (env.REGION === 'us') expectTypeOf(env.STATE).toEqualTypeOf<string>();
  // @ts-expect-error VAT_ID only exists for eu
  else env.TAX_ID;
} else {
  expectTypeOf(env.MOCK_DELAY).toEqualTypeOf<number>();
  // @ts-expect-error REGION only exists under live
  env.REGION;
}

// typo guard works at depth
createEnvironment({
  values: {
    I: {
      value: 'a',
      schema: z.enum(['a', 'b']),
      cases: {
        a: {
          J: {
            value: 'x',
            schema: z.enum(['x', 'y']),
            // @ts-expect-error unknown variant at depth 2
            cases: { z: {} },
          },
        },
      },
    },
  },
});
// two discriminators in one case body
createEnvironment({
  values: {
    I: {
      value: 'a',
      schema: z.enum(['a', 'b']),
      cases: {
        a: {
          // @ts-expect-error two discriminators in the same case body
          J: { value: 'x', schema: z.enum(['x', 'y']), cases: { x: {} } },
          // @ts-expect-error two discriminators in the same case body
          K: { value: 'x', schema: z.enum(['x', 'y']), cases: { x: {} } },
        },
      },
    },
  },
});
