import { describe, expect, it } from 'vitest';
import { type Vars, adapters } from './adapters.ts';

const ok: Vars = {
  SIMPLE: 's',
  DATABASE_URL: 'postgres://db',
  INTEGRATION: 'live',
  API_KEY: 'sk_123',
  PROVIDER: 'stripe',
  SECRET: 'abc',
};

describe.each(Object.entries(adapters))('%s', (_name, make) => {
  it('valid env: values, defaults, nesting', () => {
    const env = make(ok, { isServer: true });
    expect(env.SIMPLE).toBe('s');
    expect(env.MODE).toBe('development');
    expect(env.baseUrl.self).toBe('http://localhost:3000');
    expect(env.INTEGRATION).toBe('live');
    expect(env.API_KEY).toBe('sk_123');
    expect(env.payments.PROVIDER).toBe('stripe');
    expect(env.payments.SECRET).toBe('abc');
    expect(env.DATABASE_URL).toBe('postgres://db');
  });
  it('live + bad key throws, mentions API_KEY', () =>
    expect(() => make({ ...ok, API_KEY: 'nope' })).toThrow(/API_KEY/));
  it('live + missing key throws', () =>
    expect(() => make({ ...ok, API_KEY: undefined })).toThrow(/API_KEY/));
  it('mock + missing key ok', () =>
    expect(make({ ...ok, INTEGRATION: 'mock', API_KEY: undefined }).API_KEY).toBeUndefined());
  it('mock + present key is left alone', () =>
    expect(make({ ...ok, INTEGRATION: 'mock', API_KEY: 'whatever' }).API_KEY).toBe('whatever'));
  it('invalid discriminator reports the discriminator', () => {
    let msg = '';
    try {
      make({ ...ok, INTEGRATION: 'bogus' });
    } catch (e) {
      msg = String(e);
    }
    expect(msg).toMatch(/INTEGRATION/);
  });
  it('nested group variant: stripe needs SECRET, none does not', () => {
    expect(() => make({ ...ok, SECRET: undefined })).toThrow(/SECRET/);
    const env = make({ ...ok, PROVIDER: 'none', SECRET: undefined });
    expect(env.payments.PROVIDER).toBe('none');
    expect(env.payments.SECRET).toBeUndefined();
  });
  it('error path points at the nested key', () =>
    expect(() => make({ ...ok, SECRET: 'x' })).toThrow(/payments/));
  it('server: missing server-only var throws', () =>
    expect(() => make({ ...ok, DATABASE_URL: undefined }, { isServer: true })).toThrow(/DATABASE_URL/));
  it('client: server-only var is not validated, but access throws', () => {
    const env = make({ ...ok, DATABASE_URL: undefined }, { isServer: false });
    expect(env.SIMPLE).toBe('s');
    expect(() => env.DATABASE_URL).toThrow(/DATABASE_URL/);
  });
  it('isDisabled returns raw, unvalidated values', () => {
    const env = make({ ...ok, INTEGRATION: 'bogus', API_KEY: 'zzz' }, { isDisabled: true });
    expect(env.INTEGRATION).toBe('bogus');
    expect(env.API_KEY).toBe('zzz');
    expect(env.baseUrl.self).toBeUndefined();
  });
  it('custom onValidationError / onAccessError', () => {
    expect(() =>
      make({ ...ok, API_KEY: 'nope' }, { onValidationError: () => { throw new Error('custom-validation'); } }),
    ).toThrow('custom-validation');
    const env = make(ok, { isServer: false, onAccessError: (n) => { throw new Error(`custom-access:${n}`); } });
    expect(() => env.DATABASE_URL).toThrow('custom-access:DATABASE_URL');
  });
});
