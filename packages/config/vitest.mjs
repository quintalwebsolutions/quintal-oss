import { defineConfig } from 'vitest/config';

// Test configuration. Library builds are configured in `./tsdown.mjs`.
export default function getVitestConfig() {
  return defineConfig({
    test: {
      // TODO
      // benchmark
      watch: false,
      reporters: process.env.CI ? ['default', 'junit'] : ['default'],
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
  });
}
