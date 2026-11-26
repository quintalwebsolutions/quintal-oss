import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { createEnvironment, env as e } from './r3.ts';

const env = createEnvironment(
  z
    .object({
      MODE: e('x', z.enum(['development', 'production']).default('development')),
      SIMPLE: e('x'),
      DATABASE_URL: e('x', z.url(), { server: true }),
      baseUrl: z.object({ self: e('x', z.url().default('http://localhost:3000')) }),
      payments: z.discriminatedUnion('PROVIDER', [
        z.object({ PROVIDER: e('stripe', z.literal('stripe')), SECRET: e('s', z.string().min(3)) }),
        z.object({ PROVIDER: e('stripe', z.literal('none')) }),
      ]),
    })
    .and(
      z.discriminatedUnion('INTEGRATION', [
        z.object({ INTEGRATION: e('live', z.literal('live')), API_KEY: e('k', z.string().startsWith('sk_')) }),
        z.object({ INTEGRATION: e('live', z.literal('mock')), API_KEY: e('k', z.string().optional()) }),
      ]),
    ),
);

expectTypeOf(env.MODE).toEqualTypeOf<'development' | 'production'>();
expectTypeOf(env.SIMPLE).toEqualTypeOf<string>();
expectTypeOf(env.baseUrl.self).toEqualTypeOf<string>();
if (env.INTEGRATION === 'live') expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
else expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
if (env.payments.PROVIDER === 'stripe') expectTypeOf(env.payments.SECRET).toEqualTypeOf<string>();
// @ts-expect-error SECRET only exists for stripe
else env.payments.SECRET;
