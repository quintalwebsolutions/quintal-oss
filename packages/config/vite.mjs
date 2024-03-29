import { resolve } from 'node:path';
import { codecovVitePlugin } from '@codecov/vite-plugin';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const fileName = {
  es: 'index.mjs',
  cjs: 'index.cjs',
};

const formats = Object.keys(fileName);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(process.cwd(), 'src', 'index.ts'),
      name: '@quintal/result',
      formats,
      fileName: (format) => fileName[format],
    },
    outDir: '.dist',
  },
  test: {
    // TODO
    // benchmark
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
    react(),
    dts({ rollupTypes: true }),
    codecovVitePlugin({
      enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
      bundleName: 'quintal',
      uploadToken: process.env.CODECOV_TOKEN,
    }),
  ],
});
