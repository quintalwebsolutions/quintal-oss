import type { Workspace } from './scripts';

export const workspace: Workspace = {
  labels: [
    {
      name: 'good first issue',
      color: '#7057ff',
      description: 'Thanks for submitting your first issue or pull request',
    },
    {
      name: 'high priority',
      color: '#e50000',
      description: 'High priority issue requiring immediate attention',
    },
    {
      name: 'help wanted',
      color: '#E99600',
      description: 'Seeking contributions to address this issue',
    },
    {
      name: 'wont fix',
      color: '#e6e6e6',
      description: 'This issue or request will not be addressed',
    },
    {
      name: 'duplicate',
      color: '#cfd3d7',
      description: 'This issue or pull request already exists',
    },
    {
      name: 'in review',
      color: '#FFFF00',
      description: 'Currently being reviewed',
    },
    {
      name: 'bug',
      color: '#d73a4a',
      description: 'Something is not working as expected',
    },
    {
      name: 'feature',
      color: '#0E8A16',
      description: 'Suggestion for new functionality',
    },
    {
      name: 'fix',
      color: '#0075ca',
      description: 'A corrective action for a reported bug',
    },
    {
      name: 'question',
      color: '#d876e3',
      description: 'Some information is requested',
    },
    {
      name: 'documentation',
      color: '#FAD8C7',
      description: 'Improvements or corrections in documentation',
    },
    {
      name: 'chore',
      color: '#517FAD',
      description: 'Code changes that neither fix bugs nor add features',
    },
  ],
  packages: {
    config: {
      title: 'Quintal Config',
      description:
        'The solution to the infamous [Node.JS Config Hell Problem](https://deno.com/blog/node-config-hell)',
      keywords: ['config', 'hell', 'typescript', 'dotfiles'],
    },
    environment: {
      title: 'Quintal Environment',
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
      title: 'Quintal Monads',
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
  },
};
