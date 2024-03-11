import { describe, expect, expectTypeOf, it } from 'vitest';
import { z } from 'zod';
import { createEnvironment } from '../src';

describe('environment', () => {
  it('returns a strongly-typed environment object', () => {
    if (false as boolean) {
      const environment = createEnvironment({
        values: {
          environment: {
            value: process.env.NEXT_PUBLIC_ENVIRONMENT,
            schema: z.enum(['DEVELOPMENT', 'PREVIEW', 'PRODUCTION']).default('DEVELOPMENT'),
          },
          port: {
            value: process.env.PORT,
            schema: z.coerce.number().int().default(4000),
            isServerOnly: true,
          },
          isFeatureEnabled: {
            value: process.env.NEXT_PUBLIC_IS_FEATURE_ENABLED,
            schema: z.enum(['true', 'false']).transform((s) => s === 'true'),
          },
          baseUrl: {
            self: {
              value: process.env.NEXT_PUBLIC_BASE_URL_SELF,
              schema: z.string().url().default('http://localhost:3000'),
            },
            api: {
              value: process.env.NEXT_PUBLIC_BASE_URL_API,
              schema: z.string().url().default('http://localhost:4000'),
            },
          },
          database: {
            url: {
              value: process.env.DATABASE_URL,
              schema: z.string().url(),
              isServerOnly: true,
            },
            token: {
              value: process.env.DATABASE_TOKEN,
              isServerOnly: true,
            },
          },
        },
      });

      expectTypeOf(environment).toEqualTypeOf<{
        environment: 'DEVELOPMENT' | 'PREVIEW' | 'PRODUCTION';
        port: number;
        isFeatureEnabled: boolean;
        baseUrl: {
          self: string;
          api: string;
        };
        database: {
          url: string;
          token: string;
        };
      }>();
    }
  });

  it('throws when an environment variable is incorrect', () => {
    expect(() =>
      createEnvironment({
        values: {
          undefined: { value: undefined },
          nestedUndefined: { undefined: { value: undefined } },
          emptyString: { value: '' },
          emptyStringToNumber: { value: '', schema: z.number() },
          emptyStringWithDefault: {
            value: '',
            schema: z.string().default('test'),
          },
          emptyStringToNumberWithDefault: {
            value: '',
            schema: z.number().default(42),
          },
        },
      }),
    ).toThrowErrorMatchingInlineSnapshot(
      '[Error: ❌ Invalid environment variables: undefined: Required, nestedUndefined.undefined: Required, emptyString: Required, emptyStringToNumber: Required]',
    );
  });

  it('does not throw when accessing a client environment variable and server variables are missing', () => {
    const environment = createEnvironment({
      isServer: false,
      values: {
        correct: { value: 'hello world' },
        incorrect: { value: undefined, isServerOnly: true },
      },
    });

    expect(environment.correct).toBe('hello world');
  });

  it('throws when trying to access server-only variables from the client', () => {
    const values = {
      serverOnly: { value: 'hello', isServerOnly: true },
      notServerOnly: { value: 'world', isServerOnly: false },
      nested: {
        serverOnly: { value: 'helloNested', isServerOnly: true },
        notServerOnly: { value: 'worldNested', isServerOnly: false },
      },
    };

    const clientEnvironment = createEnvironment({ isServer: false, values });
    expect(() => clientEnvironment.serverOnly).toThrowErrorMatchingInlineSnapshot(
      `[Error: ❌ Attempted to access server-side environment variable 'serverOnly' on the client]`,
    );
    expect(clientEnvironment.notServerOnly).toBe('world');
    expect(() => clientEnvironment.nested.serverOnly).toThrowErrorMatchingInlineSnapshot(
      `[Error: ❌ Attempted to access server-side environment variable 'nested.serverOnly' on the client]`,
    );
    expect(clientEnvironment.nested.notServerOnly).toBe('worldNested');

    const serverEnvironment = createEnvironment({ isServer: true, values });
    expect(serverEnvironment.serverOnly).toBe('hello');
    expect(serverEnvironment.notServerOnly).toBe('world');
    expect(serverEnvironment.nested.serverOnly).toBe('helloNested');
    expect(serverEnvironment.nested.notServerOnly).toBe('worldNested');
  });

  it('parses (nested) environment variables to be in the correct datatype', () => {
    const environment = createEnvironment({
      values: {
        string: { value: 'hello world', schema: z.string() },
        number: { value: '42', schema: z.coerce.number().int() },
        boolean: {
          value: 'true',
          schema: z.enum(['true', 'false']).transform((s) => s === 'true'),
        },
        nested: {
          string: { value: 'nested hello world', schema: z.string() },
          number: { value: '4242', schema: z.coerce.number().int() },
          boolean: {
            value: 'false',
            schema: z.enum(['true', 'false']).transform((s) => s === 'true'),
          },
        },
      },
    });

    expect(environment.string).toBe('hello world');
    expect(environment.number).toBe(42);
    expect(environment.boolean).toBe(true);
    expect(
      // @ts-expect-error -- testing invalid access
      environment.never,
    ).toBe(undefined);
    expect(environment.nested.string).toBe('nested hello world');
    expect(environment.nested.number).toBe(4242);
    expect(environment.nested.boolean).toBe(false);
  });
});
