import { it } from 'vitest';
import { z } from 'zod';
import { createEnvironment as current } from '../index.ts';
import { adapters } from './adapters.ts';
import { createEnvironment as r1 } from './r1.ts';
import { createEnvironment as r2, v } from './r2.ts';

const ok = { SIMPLE: 's', DATABASE_URL: 'postgres://db', INTEGRATION: 'live', API_KEY: 'sk_123', PROVIDER: 'stripe', SECRET: 'abc' };
const show = (f: () => unknown) => { try { f(); return '(no error)'; } catch (e) { return String(e).replace(/\n/g, '\n      '); } };

it('probe: errors', () => {
  for (const [n, make] of Object.entries(adapters)) {
    console.log(`\n[${n}] bad API_KEY + bad MODE (pass-1 and pass-2 errors together):\n      ${show(() => make({ ...ok, MODE: 'bogus', API_KEY: 'nope' }, { isServer: true }))}`);
    console.log(`\n[${n}] bad nested SECRET only:\n      ${show(() => make({ ...ok, SECRET: 'x' }, { isServer: true }))}`);
  }
});

it('probe: a variable named "value" inside a group', () => {
  const cur = current({ isServer: true, values: { group: { value: 'x' } } }) as { group: unknown };
  console.log('\ncurrent lib   env.group =', JSON.stringify(cur.group), '(expected { value: "x" })');
  const a = r1({ isServer: true, values: { group: { value: 'x' } } }) as unknown as { group: unknown };
  console.log('R1            env.group =', JSON.stringify(a.group));
  const b = r2({ group: { value: v('x') } }, { isServer: true }) as { group: unknown };
  console.log('R2            env.group =', JSON.stringify(b.group));
  void z;
});
