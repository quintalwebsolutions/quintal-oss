import type { Packages } from './scripts';

export const packages: Packages = {
  test: {
    title: 'Test',
    description: 'Test description',
    keywords: ['key', 'words'],
  },
  monads: {
    title: 'Monads',
    description:
      'A collection of monads (Result, Option) for TypeScript, inspired by [the Rust programming language](https://doc.rust-lang.org/std/result/).',
    keywords: ['monads', 'monad', 'result', 'option', 'error', 'null'],
    features: [
      { icon: '🦀', text: 'Implements all relevant methods from Rust' },
      { icon: '✅', text: 'CommonJS and ES Modules support' },
      { icon: '📖', text: 'Extensive documentation' },
      { icon: '⚖️', text: 'Super lightweight (only ~1kb gzipped)' },
      { icon: '🙅', text: '0 dependencies' },
      { icon: '🧪', text: '100% test coverage' },
    ],
    roadmap: [
      "Figure out a way to emulate [Rust's question mark syntax](https://doc.rust-lang.org/std/result/#the-question-mark-operator-)",
      'Serialize and deserialize monads for API usage',
      "Write docs on [Rust's must-use property](https://doc.rust-lang.org/std/result/#results-must-be-used)",
    ],
  },
  // environment: {
  //   title: 'Environment',
  //   description: 'Framework-agnostic environment variable validation for TypeScript',
  //   keywords: ['environment', 'validation', 'zod'],
  // },
};
