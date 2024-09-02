import { z } from 'zod';
import type { ZodError, ZodType } from 'zod';

type EnvValue = {
  /**
   * The value
   * @example process.env.NODE_ENV
   * @example process.env.DATABASE_URL
   * @example process.env.NEXT_PUBLIC_ENVIRONMENT
   */
  value: string | undefined;
  /**
   * Zod schema that validates the value of the environment variable.
   * @defaultValue z.string()
   */
  schema?: ZodType;
  /**
   * Only make environment variable available for server-side usage.
   * @defaultValue false
   */
  isServerOnly?: boolean;
};

type EnvValues = { [key: string]: EnvValue | EnvValues | string | undefined };

type UnwrapEnvValue<T> = T extends string
  ? string
  : T extends EnvValue
    ? T extends Required<Pick<EnvValue, 'schema'>>
      ? ReturnType<T['schema']['parse']>
      : string
    : T extends Record<string, unknown>
      ? { [TKey in keyof T]: UnwrapEnvValue<T[TKey]> }
      : never;

type UnwrapEnvValues<TEnvValues extends EnvValues> = {
  [TKey in keyof TEnvValues]: UnwrapEnvValue<TEnvValues[TKey]>;
} & unknown;

type CreateEnvironmentOptions<TEnvValues extends EnvValues> = {
  /**
   * Whether or not the application is running on the server.
   * @defaultValue typeof window === 'undefined'
   */
  isServer?: boolean;
  /**
   * Called when validation fails.
   * Default behaviour: throw Error
   */
  onValidationError?: (error: ZodError) => never;
  /**
   * Called when a server-side environment variable is accessed on the client.
   * Default behaviour: throw Error
   */
  onAccessError?: (variableName: string) => never;
  /**
   * The values in the typed environment object.
   */
  values: TEnvValues;
};

function makeValues(values: EnvValues): Record<string, unknown> {
  return Object.entries(values).reduce(
    (prev, [name, obj]) => {
      if (typeof obj === 'string' || typeof obj === 'undefined') prev[name] = obj;
      else if ('value' in obj) prev[name] = obj.value || undefined;
      else prev[name] = makeValues(obj);
      return prev;
    },
    {} as Record<string, unknown>,
  );
}

function makeSchema(values: EnvValues, isServer: boolean): ZodType {
  const o = Object.entries(values).reduce(
    (prev, [name, obj]) => {
      if (typeof obj === 'string' || typeof obj === 'undefined') prev[name] = z.string();
      else if ('value' in obj) {
        if (!obj.isServerOnly || isServer)
          prev[name] = (obj.schema as ZodType | undefined) ?? z.string();
      } else prev[name] = makeSchema(obj, isServer);
      return prev;
    },
    {} as Record<string, ZodType>,
  );
  return z.object(o);
}

function createProxy<TEnvValues extends EnvValues>(
  values: UnwrapEnvValues<TEnvValues>,
  originalValues: EnvValues,
  isServer: boolean,
  onAccessError: (variableName: string) => never,
  prefix?: string,
): UnwrapEnvValues<TEnvValues> {
  return new Proxy(values, {
    get(target, prop: string) {
      const targetValue = originalValues[prop];
      if (!targetValue) return undefined;
      if (typeof targetValue === 'string') return targetValue;

      const variableName = prefix ? `${prefix}.${prop}` : prop;

      if (!('value' in targetValue))
        return createProxy(
          values[prop] as UnwrapEnvValues<TEnvValues>,
          originalValues[prop] as EnvValues,
          isServer,
          onAccessError,
          variableName,
        );

      if (targetValue.isServerOnly && !isServer) return onAccessError(variableName);

      return target[prop];
    },
  });
}

export function createEnvironment<TEnvValues extends EnvValues>(
  opts: CreateEnvironmentOptions<TEnvValues>,
): UnwrapEnvValues<TEnvValues> {
  const isServer = opts.isServer ?? typeof window === 'undefined';

  const onValidationError =
    opts.onValidationError ??
    ((error: ZodError) => {
      throw new Error(
        `❌ Invalid environment variables: ${error.issues
          .map(({ path, message }) => `${path.join('.')}: ${message}`)
          .join(', ')}`,
      );
    });

  const onAccessError =
    opts.onAccessError ??
    ((variableName: string) => {
      throw new Error(
        `❌ Attempted to access server-side environment variable '${variableName}' on the client`,
      );
    });

  const schema = makeSchema(opts.values, isServer);
  const values = makeValues(opts.values);

  const parsed = schema.safeParse(values);
  if (!parsed.success) return onValidationError(parsed.error);

  return createProxy(
    parsed.data as UnwrapEnvValues<TEnvValues>,
    opts.values,
    isServer,
    onAccessError,
  );
}
