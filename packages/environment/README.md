# @quintal/environment

Type-safe environment variable validation

```ts
export const environment = createEnvironment({
  values: {
    environment: {
      value: process.env.NEXT_PUBLIC_ENVIRONMENT,
      schema: z
        .enum(['DEVELOPMENT', 'PREVIEW', 'PRODUCTION'])
        .default('DEVELOPMENT'),
    },
    port: {
      value: process.env.PORT,
      schema: z.coerce.number().int().default(4000),
      isServerOnly: true,
    },
    isFeatureEnabled: {
      value: process.env.IS_FEATURE_ENABLED,
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
```

Every environment variable is defined as an object with the following properties

```ts
type EnvVariableDefinition = {
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
   * Only make environment variable available to server usages.
   * @defaultValue false
   */
  isServerOnly?: boolean;
};
```
