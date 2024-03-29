<!--
THIS FILE IS (PARTIALLY) AUTO-GENERATED USING `pnpm generate`.
TO EDIT THE CONTENT, PLEASE MODIFY `/workspace.ts` OR `/scripts/generate.ts`
-->

# Quintal Config

[![NPM version](https://img.shields.io/npm/v/@quintal/config?style=flat-square)](https://npmjs.com/@quintal/config)
[![NPM downloads](https://img.shields.io/npm/dt/@quintal/config?style=flat-square)](https://npmjs.com/@quintal/config)
[![License](https://img.shields.io/npm/l/@quintal/config?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@quintal/config?style=flat-square)](https://bundlephobia.com/package/@quintal/config)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@quintal/config?style=flat-square)](https://libraries.io/npm/%40quintal%2Fconfig/)
[![Code coverage](https://img.shields.io/codecov/c/github/quintalwebsolutions/quintal-oss?style=flat-square&token=3ORY9UP6H7&flag=config&logo=codecov)](https://codecov.io/gh/quintalwebsolutions/quintal-oss)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CONTRIBUTING.md)

Type-safe configuration file management with sensible defaults for your favourite tools.

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/config)

## Table of Contents

- [Getting Started](#getting-started)
- [Rationale](#rationale)
- [Examples](#examples)

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

## Rationale

This package poses as a solution to the infamous [Node.JS Config Hell Problem](https://deno.com/blog/node-config-hell). It is a CLI tool that generates configuration files based on a TypeScript declaration. If possible, it puts the generated output in a `.config` directory in order to clean up your root directory. Besides that, we included a bunch of recommended configurations for often-used tools. You will never have to worry about configuration again.

## Examples

You can define all your config in a `config.ts` file at the root of your project.

```ts
// config.ts

import { defineConfig } from '@quintal/config';
import { biomeRecommendedConfig } from '@quintal/config-biome';
import {
  typescriptConfig,
  typescriptRecommendedConfig,
} from '@quintal/config-typescript';

export default defineConfig({
  outputDir: '.config',
  configs: [
    biomeRecommendedConfig,
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
