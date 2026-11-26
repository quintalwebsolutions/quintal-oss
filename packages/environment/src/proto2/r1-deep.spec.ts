import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createEnvironment } from './r1.ts';

type V = Record<string, string | undefined>;
const make = (x: V, o: { isServer?: boolean; isDisabled?: boolean } = {}) =>
  createEnvironment({
    isServer: true,
    ...o,
    values: {
      PLAIN: x.PLAIN,
      INTEGRATION: {
        value: x.INTEGRATION,
        schema: z.enum(['live', 'mock']),
        cases: {
          live: {
            API_KEY: { value: x.API_KEY, schema: z.string().startsWith('sk_') },
            REGION: {
              value: x.REGION,
              schema: z.enum(['eu', 'us']),
              cases: {
                eu: { VAT_ID: { value: x.VAT_ID, schema: z.string() } },
                us: {
                  TAX_ID: { value: x.TAX_ID, schema: z.string(), isServerOnly: true },
                  STATE: { value: x.STATE, schema: z.string().length(2) },
                },
              },
            },
          },
          mock: { MOCK_DELAY: { value: x.MOCK_DELAY, schema: z.coerce.number().default(0) } },
        },
      },
    },
  });

const live: V = { PLAIN: 'p', INTEGRATION: 'live', API_KEY: 'sk_1', REGION: 'eu', VAT_ID: 'NL1', TAX_ID: 't', STATE: 'CA' };
const show = (f: () => unknown) => { try { f(); return '(no error)'; } catch (e) { return String(e); } };

describe('R1 recursed cases (runtime)', () => {
  it('prints the runtime shape per branch', () => {
    const shapes = {
      'live/eu': make(live),
      'live/us': make({ ...live, REGION: 'us' }),
      'mock': make({ PLAIN: 'p', INTEGRATION: 'mock', MOCK_DELAY: '250', API_KEY: 'ignored' }),
      'mock (default)': make({ PLAIN: 'p', INTEGRATION: 'mock' }),
    };
    for (const [k, env] of Object.entries(shapes)) console.log(k.padEnd(15), JSON.stringify(env));
    expect(JSON.stringify(shapes['live/eu'])).toBe('{"PLAIN":"p","INTEGRATION":"live","API_KEY":"sk_1","REGION":"eu","VAT_ID":"NL1"}');
    expect('TAX_ID' in (shapes['live/eu'] as object)).toBe(false);
    expect('MOCK_DELAY' in (shapes['live/eu'] as object)).toBe(false);
  });
  it('mock leaves unrelated vars alone: no API_KEY/REGION keys at all', () => {
    const env = make({ PLAIN: 'p', INTEGRATION: 'mock', API_KEY: 'x' }) as Record<string, unknown>;
    expect('API_KEY' in env).toBe(false);
    expect(env.MOCK_DELAY).toBe(0);
  });
  it('errors carry the flat path at every depth', () => {
    console.log('\n-- depth 2 error (bad STATE under live/us):\n' + show(() => make({ ...live, REGION: 'us', STATE: 'California' })));
    console.log('\n-- depth 1 error (bad API_KEY, REGION never inspected):\n' + show(() => make({ ...live, API_KEY: 'nope', REGION: 'bogus' })));
    console.log('\n-- depth 2 invalid discriminator:\n' + show(() => make({ ...live, REGION: 'bogus' })));
    expect(() => make({ ...live, REGION: 'us', STATE: 'California' })).toThrow(/STATE/);
    expect(() => make({ ...live, REGION: 'eu', VAT_ID: undefined })).toThrow(/VAT_ID/);
    expect(() => make({ ...live, REGION: 'bogus' })).toThrow(/REGION/);
  });
  it('server-only var inside a nested case: client skips validation, access throws', () => {
    const env = make({ ...live, REGION: 'us', TAX_ID: undefined }, { isServer: false }) as Record<string, unknown>;
    expect(env.STATE).toBe('CA');
    expect(() => env.TAX_ID).toThrow(/TAX_ID/);
    expect(() => make({ ...live, REGION: 'us', TAX_ID: undefined }, { isServer: true })).toThrow(/TAX_ID/);
  });
  it('isDisabled returns every branch raw, flat', () => {
    const env = make({ ...live, INTEGRATION: 'bogus', REGION: 'bogus' }, { isDisabled: true });
    console.log('\ndisabled       ', JSON.stringify(env));
    expect(env).toMatchObject({ INTEGRATION: 'bogus', API_KEY: 'sk_1', REGION: 'bogus', VAT_ID: 'NL1', TAX_ID: 't', STATE: 'CA' });
  });
});
