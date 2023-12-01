# @quintal/config

The plan for this package is to be the solution to the infamous
[Node.JS Config Hell Problem](https://deno.com/blog/node-config-hell). This
package will be a CLI tool that auto-generates configuration files in a
`.config` directory at the root of your repository, based on a config.ts file in
your project root.

# Example

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
