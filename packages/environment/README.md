<!--
THIS FILE IS (PARTIALLY) AUTO-GENERATED USING `pnpm generate`.
TO EDIT THE CONTENT, PLEASE MODIFY `/workspace.ts` OR `/scripts/generate.ts`
-->

# Quintal Environment

[![NPM version](https://img.shields.io/npm/v/@quintal/environment?style=flat-square)](https://npmjs.com/@quintal/environment)
[![NPM downloads](https://img.shields.io/npm/dt/@quintal/environment?style=flat-square)](https://npmjs.com/@quintal/environment)
[![License](https://img.shields.io/npm/l/@quintal/environment?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@quintal/environment?style=flat-square)](https://bundlephobia.com/package/@quintal/environment)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@quintal/environment?style=flat-square)](https://libraries.io/npm/%40quintal%2Fenvironment/)
[![Code coverage](https://img.shields.io/codecov/c/github/quintalwebsolutions/quintal-oss?style=flat-square&token=3ORY9UP6H7&flag=environment&logo=codecov)](https://codecov.io/gh/quintalwebsolutions/quintal-oss)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CONTRIBUTING.md)

Framework-agnostic environment variable validation for TypeScript

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/environment)

## Table of Contents

- [Getting Started](#getting-started)
- [Kitchen Sink Example](#kitchen-sink-example)

## Getting Started

```sh
pnpm add @quintal/environment
# or
bun add @quintal/environment
# or
yarn add @quintal/environment
# or
npm install @quintal/environment
```

<!-- END AUTO-GENERATED: Add custom documentation after this comment -->

## Kitchen Sink Example

```ts
export const environment = createEnvironment({
  values: {
    environment: {
      value: process.env.NEXT_PUBLIC_ENVIRONMENT,
      description: 'Self-provided environment indicator',
      schema: z
        .enum(['DEVELOPMENT', 'PREVIEW', 'PRODUCTION'])
        .default('DEVELOPMENT'),
    },
    port: {
      value: process.env.PORT,
      schema: z.coerce.number().int().default(4000),
      isServerOnly: true,
    },
    simpleStringValue: process.env.SIMPLE_STRING_VALUE,
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
type EnvValue = {
  /**
   * The value
   * @example process.env.NODE_ENV
   * @example process.env.DATABASE_URL
   * @example process.env.NEXT_PUBLIC_ENVIRONMENT
   */
  value: string | undefined;
  /**
   * A description of the contents of the environment variable.
   * @defaultValue undefined
   */
  description?: string;
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
```
