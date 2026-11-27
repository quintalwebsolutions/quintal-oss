import { defineConfig } from 'vitest/config';

export function getVitestConfig() {
  return defineConfig({
    test: {
      watch: false,
      reporters: process.env.CI ? ['default', 'junit'] : ['default'],
      outputFile: 'junit.xml',
      coverage: {
        enabled: true,
        provider: 'v8',
        include: ['src/**/*.ts'],
        reportsDirectory: '.coverage',
        reporter: process.env.CI ? ['json', 'text'] : ['text'],
      },
      environment: 'happy-dom',
    },
  });
}
