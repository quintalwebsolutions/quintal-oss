import { expectTypeOf } from 'vitest';
import { z } from 'zod';
import { define } from './c-builder.ts';

const env = define({
  values: {
    PLAIN: 'x',
    INTEGRATION: { value: 'live', schema: z.enum(['live', 'mock']) },
    REGION: { value: 'eu', schema: z.enum(['eu', 'us']) },
    API_KEY: { value: 'k', schema: z.string().optional() },
    DB: { value: 'd', schema: z.string().optional() },
  },
})
  .when('INTEGRATION', 'live', { API_KEY: z.string().startsWith('sk_') })
  .when('REGION', 'eu', (e) => {
    // env is already narrowed to the eu members, and sees earlier overrides
    expectTypeOf(e.REGION).toEqualTypeOf<'eu'>();
    expectTypeOf(e.INTEGRATION).toEqualTypeOf<'live' | 'mock'>();
    return { DB: z.url() };
  })
  .create();

if (env.INTEGRATION === 'live') expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
else expectTypeOf(env.API_KEY).toEqualTypeOf<string | undefined>();
if (env.REGION === 'eu') expectTypeOf(env.DB).toEqualTypeOf<string>();
else expectTypeOf(env.DB).toEqualTypeOf<string | undefined>();
if (env.INTEGRATION === 'live' && env.REGION === 'eu') {
  expectTypeOf(env.API_KEY).toEqualTypeOf<string>();
  expectTypeOf(env.DB).toEqualTypeOf<string>();
}

define({ values: { I: { value: 'a', schema: z.enum(['a', 'b']) }, K: 'x' } })
  // @ts-expect-error unknown variant
  .when('I', 'c', { K: z.string() });
define({ values: { I: { value: 'a', schema: z.enum(['a', 'b']) }, K: 'x' } })
  // @ts-expect-error unknown override key
  .when('I', 'a', { NOPE: z.string() });
define({ values: { I: { value: 'a', schema: z.enum(['a', 'b']) }, K: 'x' } })
  // @ts-expect-error unknown discriminator
  .when('NOPE', 'a', { K: z.string() });
