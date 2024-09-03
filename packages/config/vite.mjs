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

export default function getViteConfig(bundleName) {
  return defineConfig({
    build: {
      lib: {
        entry: resolve(process.cwd(), 'src', 'index.ts'),
        name: bundleName,
        formats,
        fileName: (format) => fileName[format],
      },
      outDir: '.dist',
    },
    test: {
      // TODO
      // benchmark
      watch: false,
      reporters: process.env.CI ? ['junit'] : ['default'],
      outputFile: 'junit.xml',
      coverage: {
        enabled: true,
        provider: 'v8',
        include: ['src/**/*.ts'],
        reportsDirectory: '.coverage',
        reporter: ['json', 'text'],
      },
      environment: 'happy-dom',
    },
    plugins: [
      react(),
      dts({ rollupTypes: true }),
      codecovVitePlugin({
        enableBundleAnalysis: process.env.CODECOV_TOKEN !== undefined,
        bundleName,
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
  });
}
