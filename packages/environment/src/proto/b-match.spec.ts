import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createEnvironment } from '../index.ts';
import { variable } from './b-match.ts';

const make = (INTEGRATION: string | undefined, API_KEY: string | undefined) => {
  const integration = variable({ value: INTEGRATION, schema: z.enum(['live', 'mock']) });
  return createEnvironment({
    values: {
      INTEGRATION: integration,
      API_KEY: {
        value: API_KEY,
        schema: integration.match({ live: z.string().startsWith('sk_'), mock: z.string().optional() }),
      },
    },
  });
};

describe('match prototype on real createEnvironment', () => {
  it('live + valid key passes', () => expect(make('live', 'sk_abc').API_KEY).toBe('sk_abc'));
  it('live + bad key throws', () => expect(() => make('live', 'nope')).toThrow(/API_KEY/));
  it('live + missing key throws', () => expect(() => make('live', undefined)).toThrow(/API_KEY/));
  it('mock + missing key ok', () => expect(make('mock', undefined).API_KEY).toBeUndefined());
  it('mock + present key kept as is', () => expect(make('mock', 'whatever').API_KEY).toBe('whatever'));
  it('invalid discriminator reports only itself', () => {
    expect(() => make('bogus', 'x')).toThrow(/INTEGRATION/);
    try { make('bogus', 'x'); } catch (e) { expect(String(e)).not.toMatch(/API_KEY/); }
  });
});
