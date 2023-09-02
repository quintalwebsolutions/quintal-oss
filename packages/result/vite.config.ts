/// <reference types="vitest" />

import { resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const fileName = {
  es: `index.mjs`,
  cjs: `index.cjs`,
};

const formats = Object.keys(fileName) as Array<keyof typeof fileName>;

module.exports = defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "@quintal/result",
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
      provider: "v8",
      include: ["src/**/*.ts"],
      reportsDirectory: ".coverage",
    },
  },
  plugins: [dts()],
});
