import type { Packages } from './scripts';

export const packages: Packages = {
  config: {
    title: 'Config',
    description:
      'the solution to the infamous [Node.JS Config Hell Problem](https://deno.com/blog/node-config-hell).',
    keywords: ['config', 'hell', 'typescript', 'dotfiles'],
  },
  environment: {
    title: 'Environment',
    description: 'Framework-agnostic environment variable validation for TypeScript',
    keywords: ['environment', 'validation', 'typescript', 'zod'],
  },
  'form-engine-react': {
    title: 'Quintal React Form Engine',
    description:
      'A headless, declarative, lightweight form engine for React apps with first-class TypeScript support.',
    keywords: ['react', 'form', 'hook', 'validation', 'headless', 'typescript'],
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
      {
        text: "Figure out a way to emulate [Rust's question mark syntax](https://doc.rust-lang.org/std/result/#the-question-mark-operator-)",
      },
      { text: 'Serialize and deserialize monads for API usage' },
      {
        text: "Write docs on [Rust's must-use property](https://doc.rust-lang.org/std/result/#results-must-be-used)",
      },
    ],
  },
  'table-engine-react': {
    title: 'Quintal React Table Engine',
    description: 'A headless, declarative, lightweight, type-safe table engine for React apps.',
    keywords: ['react', 'table', 'hook', 'headless', 'typescript'],
  },
};
