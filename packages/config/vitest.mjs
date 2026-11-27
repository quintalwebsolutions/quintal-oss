import { defineConfig } from 'vitest/config';

const IS_CI = process.env.CI;

export function getVitestConfig() {
  return defineConfig({
    test: {
      watch: false,
      reporters: IS_CI ? ['default', 'junit'] : ['default'],
      outputFile: 'junit.xml',
      coverage: {
        enabled: true,
        provider: 'v8',
        include: ['src/**/*.ts'],
        reportsDirectory: '.coverage',
        reporter: IS_CI ? ['json', 'text'] : ['text'],
      },
      environment: 'happy-dom',
    },
  });
}
