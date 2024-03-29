// biome-ignore lint/nursery/noNodejsModules: vite config is run in a Node.js context
import path from 'node:path';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { externalizeDeps } from 'vite-plugin-externalize-deps';

const fileExtension = {
  es: '.mjs',
  cjs: '.cjs',
};

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: path.resolve(process.cwd(), 'src', 'index.ts'),
      },
      formats: Object.keys(fileExtension),
      fileName: (format, entryName) => `${entryName}${fileExtension[format]}`,
    },
    outDir: '.dist',
  },
  test: {
    watch: false,
    coverage: {
      enabled: true,
      provider: 'v8',
      include: ['src/**/*.ts'],
      reportsDirectory: '.coverage',
      reporter: ['json'],
    },
    environment: 'happy-dom',
  },
  plugins: [
    dts({ rollupTypes: true }),
    externalizeDeps(),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: 'quintal',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
