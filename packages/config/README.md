# Config

[![NPM version](https://img.shields.io/npm/v/@quintal/config?style=flat-square)](https://npmjs.com/@quintal/config)
[![NPM downloads](https://img.shields.io/npm/dt/@quintal/config?style=flat-square)](https://npmjs.com/@quintal/config)
[![License](https://img.shields.io/npm/l/@quintal/config?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/LICENSE)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@quintal/config?style=flat-square)](https://bundlephobia.com/package/@quintal/config)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@quintal/config?style=flat-square)](https://libraries.io/npm/%40quintal%2Fconfig/)
[![Pull requests welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/quintalwebsolutions/quintal-oss/blob/main/CONTRIBUTING.md)

the solution to the infamous [Node.JS Config Hell Problem](https://deno.com/blog/node-config-hell).

You can explore [the exposed functions and types on ts-docs](https://tsdocs.dev/docs/@quintal/config)

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
