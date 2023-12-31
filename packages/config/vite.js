const { resolve } = require('node:path');
const { defineConfig } = require('vite');
const dts = require('vite-plugin-dts');
const react = require('@vitejs/plugin-react');

const fileName = {
  es: `index.mjs`,
  cjs: `index.cjs`,
};

const formats = Object.keys(fileName);

module.exports = defineConfig({
  build: {
    lib: {
      entry: resolve(process.cwd(), 'src', 'index.ts'),
      name: '@quintal/result',
      formats,
      fileName: (format) => fileName[format],
    },
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
    },
    environment: 'happy-dom',
  },
  plugins: [react(), dts({ rollupTypes: true })],
});
