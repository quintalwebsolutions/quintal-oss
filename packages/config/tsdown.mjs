import { codecovRollupPlugin } from '@codecov/rollup-plugin';
import { defineConfig } from 'tsdown';

const base = {
  entry: 'src/index.ts',
  format: 'esm',
  outDir: '.dist',
  // The package is ESM-only (`"type": "module"`), so emit `.js` and `.d.ts` instead of `.mjs` and `.d.mts`.
  fixedExtension: false,
};

export function getTsdownConfig(bundleName) {
  return defineConfig([
    {
      ...base,
      clean: true,
      minify: true,
      dts: false,
      // Kept separate from the declarations build: otherwise the .d.ts files are counted as bundle size.
      plugins: [
        codecovRollupPlugin({
          enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
          bundleName,
          uploadToken: process.env.CODECOV_TOKEN,
        }),
      ],
    },
    {
      ...base,
      clean: false,
      dts: { dtsOnly: true },
      // Lint the package.json (exports, types, files) and the published type resolution.
      publint: true,
      attw: { profile: 'esm-only' },
    },
  ]);
}
