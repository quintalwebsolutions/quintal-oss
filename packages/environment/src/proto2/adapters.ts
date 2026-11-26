import { z } from 'zod';
import type { ZodError } from 'zod';
import { createEnvironment as r1 } from './r1.ts';
import { createEnvironment as r2, v } from './r2.ts';
import { createEnvironment as r3, env as e } from './r3.ts';

export type Vars = Record<string, string | undefined>;
export type Opts = {
  isDisabled?: boolean;
  isServer?: boolean;
  onValidationError?: (error: ZodError) => never;
  onAccessError?: (name: string) => never;
};
// biome-ignore lint/suspicious/noExplicitAny: shared spec reads the same shape from every design
export type Make = (x: Vars, o?: Opts) => any;

const mode = () => z.enum(['development', 'production']).default('development');
const base = () => z.url().default('http://localhost:3000');

export const adapters: Record<string, Make> = {
  R1: (x, o) =>
    r1({
      ...o,
      values: {
        MODE: { value: x.MODE, schema: mode() },
        SIMPLE: x.SIMPLE,
        DATABASE_URL: { value: x.DATABASE_URL, schema: z.url(), isServerOnly: true },
        baseUrl: { self: { value: x.BASE_SELF, schema: base() } },
        INTEGRATION: {
          value: x.INTEGRATION,
          schema: z.enum(['live', 'mock']),
          cases: {
            live: { API_KEY: { value: x.API_KEY, schema: z.string().startsWith('sk_') } },
            mock: { API_KEY: { value: x.API_KEY, schema: z.string().optional() } },
          },
        },
        payments: {
          PROVIDER: {
            value: x.PROVIDER,
            schema: z.enum(['stripe', 'none']),
            cases: { stripe: { SECRET: { value: x.SECRET, schema: z.string().min(3) } }, none: {} },
          },
        },
      },
    }),

  R2: (x, o) =>
    r2(
      {
        MODE: v(x.MODE, mode()),
        SIMPLE: x.SIMPLE,
        DATABASE_URL: v(x.DATABASE_URL, z.url(), { server: true }),
        baseUrl: { self: v(x.BASE_SELF, base()) },
        INTEGRATION: v(x.INTEGRATION, z.enum(['live', 'mock'])).cases({
          live: { API_KEY: v(x.API_KEY, z.string().startsWith('sk_')) },
          mock: { API_KEY: v(x.API_KEY, z.string().optional()) },
        }),
        payments: {
          PROVIDER: v(x.PROVIDER, z.enum(['stripe', 'none'])).cases({
            stripe: { SECRET: v(x.SECRET, z.string().min(3)) },
            none: {},
          }),
        },
      },
      o,
    ),

  R3: (x, o) =>
    r3(
      z
        .object({
          MODE: e(x.MODE, mode()),
          SIMPLE: e(x.SIMPLE),
          DATABASE_URL: e(x.DATABASE_URL, z.url(), { server: true }),
          baseUrl: z.object({ self: e(x.BASE_SELF, base()) }),
          payments: z.discriminatedUnion('PROVIDER', [
            z.object({ PROVIDER: e(x.PROVIDER, z.literal('stripe')), SECRET: e(x.SECRET, z.string().min(3)) }),
            z.object({ PROVIDER: e(x.PROVIDER, z.literal('none')) }),
          ]),
        })
        .and(
          z.discriminatedUnion('INTEGRATION', [
            z.object({
              INTEGRATION: e(x.INTEGRATION, z.literal('live')),
              API_KEY: e(x.API_KEY, z.string().startsWith('sk_')),
            }),
            z.object({
              INTEGRATION: e(x.INTEGRATION, z.literal('mock')),
              API_KEY: e(x.API_KEY, z.string().optional()),
            }),
          ]),
        ),
      o,
    ),
};
