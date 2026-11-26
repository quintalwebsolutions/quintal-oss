import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createEnvironment, v } from './r2.ts';

const env = createEnvironment({
  MODE: v('x', z.enum(['development', 'production']).default('development')),
  SIMPLE: 'x',
  DATABASE_URL: v('x', z.url(), { server: true }),
  value: v('x'), // a variable literally named "value" is fine (no key sniffing)
  baseUrl: { self: v('x', z.url().default('http://localhost:3000')) },
  INTEGRATION: v('live', z.enum(['live', 'mock'])).cases({
    live: { API_KEY: v('k', z.string().startsWith('sk_')) },
    mock: { API_KEY: v('k', z.string().optional()) },
  }),
  payments: {
    PROVIDER: v('stripe', z.enum(['stripe', 'none'])).cases({
      stripe: { SECRET: v('s', z.string().min(3)) },
      none: {},
    }),
  },
});

expectTypeOf(env.MODE).toEqualTypeOf<'development' | 'production'>();
expectTypeOf(env.SIMPLE).toEqualTypeOf<string>();
expectTypeOf(env.value).toEqualTypeOf<string>();
expectTypeOf(env.baseUrl.self).toEqualTypeOf<string>();
if (env.INTEGRATION === 'live') expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
else expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
if (env.payments.PROVIDER === 'stripe') expectTypeOf(env.payments.SECRET).toEqualTypeOf<string>();
// @ts-expect-error SECRET only exists for stripe
else env.payments.SECRET;
if (env.INTEGRATION === 'mock' && env.payments.PROVIDER === 'stripe') {
  expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
  expectTypeOf(env.payments.SECRET).toEqualTypeOf<string>();
}

// errors
v('a', z.enum(['a', 'b'])).cases({
  // @ts-expect-error unknown variant
  c: {},
});
createEnvironment({
  // @ts-expect-error two discriminators in one group
  I: v('a', z.enum(['a', 'b'])).cases({ a: {} }),
  // @ts-expect-error two discriminators in one group
  J: v('a', z.enum(['a', 'b'])).cases({ a: {} }),
});
