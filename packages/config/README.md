<!--
THIS FILE IS (PARTIALLY) AUTO-GENERATED USING `pnpm generate`.
TO EDIT THE CONTENT, PLEASE MODIFY `/workspace.ts` OR `/scripts/generate.ts`
-->

# Quintal Config

[![NPM version](https://img.shields.io/npm/v/@quintal/config?style=flat-square)](https://npmjs.com/@quintal/config)
[![NPM downloads](https://img.shields.io/npm/dt/@quintal/config?style=flat-square)](https://npmjs.com/@quintal/config)
[![License](https://img.shields.io/npm/l/@quintal/config?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@quintal/config?style=flat-square)](https://bundlephobia.com/package/@quintal/config)
[![Code coverage](https://img.shields.io/codecov/c/github/quintalwebsolutions/quintal-oss?style=flat-square&token=3ORY9UP6H7&flag=config&logo=codecov)](https://app.codecov.io/gh/quintalwebsolutions/quintal-oss/flags?historicalTrend=LAST_7_DAYS&flags%5B0%5D=config)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CONTRIBUTING.md)

The solution to the infamous [Node.JS Config Hell Problem](https://deno.com/blog/node-config-hell)

## Table of Contents

- [Getting Started](#getting-started)
- [Plan](#plan)
- [Example](#example)

## Getting Started

```sh
pnpm add @quintal/config
# or
bun add @quintal/config
# or
yarn add @quintal/config
# or
npm install @quintal/config
```

<!-- END AUTO-GENERATED: Add custom documentation after this comment -->

## Plan

The plan for this package is to be the solution to the infamous
[Node.JS Config Hell Problem](https://deno.com/blog/node-config-hell). This
package will be a CLI tool that auto-generates configuration files in a
`.config` directory at the root of your repository, based on a config.ts file in
your project root.

## Example

You can define all your config in the `config.ts` file at the root of your
project.

```ts
// config.ts

import { defineConfig } from '@quintal/config';
import { prettierRecommendedConfig } from '@quintal/config-prettier';
import { eslintRecommendedConfig } from '@quintal/config-eslint';
import {
  typescriptConfig,
  typescriptRecommendedConfig,
} from '@quintal/config-typescript';

export default defineConfig({
  outputDir: '.config',
  configs: [
    prettierRecommendedConfig,
    eslintRecommendedConfig,
    typescriptConfig({
      ...typescriptRecommendedConfig,
      noPropertyAccessFromIndexSignature: false,
    }),
  ],
});
```

After creating this config file, you can run the `quintal-config install`
command to install all packages required to use the packages defined in your
config file. Then run the `quintal-config generate` command on postinstall, and
you never have to worry about configuration again.
