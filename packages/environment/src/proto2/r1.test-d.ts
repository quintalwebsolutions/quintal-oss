import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createEnvironment } from './r1.ts';

const env = createEnvironment({
  values: {
    MODE: { value: 'x', schema: z.enum(['development', 'production']).default('development') },
    SIMPLE: 'x',
    DATABASE_URL: { value: 'x', schema: z.url(), isServerOnly: true },
    baseUrl: { self: { value: 'x', schema: z.url().default('http://localhost:3000') } },
    INTEGRATION: {
      value: 'live',
      schema: z.enum(['live', 'mock']),
      cases: {
        live: { API_KEY: { value: 'k', schema: z.string().startsWith('sk_') } },
        mock: { API_KEY: { value: 'k', schema: z.string().optional() } },
      },
    },
    payments: {
      PROVIDER: {
        value: 'stripe',
        schema: z.enum(['stripe', 'none']),
        cases: { stripe: { SECRET: { value: 's', schema: z.string().min(3) } }, none: {} },
      },
    },
  },
});

expectTypeOf(env.MODE).toEqualTypeOf<'development' | 'production'>();
expectTypeOf(env.SIMPLE).toEqualTypeOf<string>();
expectTypeOf(env.baseUrl.self).toEqualTypeOf<string>();
if (env.INTEGRATION === 'live') expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
else expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
// nested group is its own union
if (env.payments.PROVIDER === 'stripe') expectTypeOf(env.payments.SECRET).toEqualTypeOf<string>();
// @ts-expect-error SECRET only exists for stripe
else env.payments.SECRET;
// the two discriminators are independent
if (env.INTEGRATION === 'mock' && env.payments.PROVIDER === 'stripe') {
  expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
  expectTypeOf(env.payments.SECRET).toEqualTypeOf<string>();
}

// errors
createEnvironment({
  values: {
    I: {
      value: 'a',
      schema: z.enum(['a', 'b']),
      // @ts-expect-error unknown variant
      cases: { c: {} },
    },
  },
});
createEnvironment({
  values: {
    // @ts-expect-error two discriminators in one group (both are flagged)
    I: { value: 'a', schema: z.enum(['a', 'b']), cases: { a: {} } },
    // @ts-expect-error two discriminators in one group
    J: { value: 'a', schema: z.enum(['a', 'b']), cases: { a: {} } },
  },
});
createEnvironment({
  values: {
    group: {
      I: {
        value: 'a',
        schema: z.enum(['a', 'b']),
        // @ts-expect-error typo guard works inside nested groups and inside cases
        cases: { a: { J: { value: 'a', schema: z.enum(['x']), cases: { zzz: {} } } } },
      },
    },
  },
});
