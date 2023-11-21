const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
  ].map(require.resolve),
  parserOptions: {
    project,
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    'prefer-named-capture-group': 'off',
    '@typescript-eslint/naming-convention': 'off', // TODO check how to configure this
    '@typescript-eslint/prefer-reduce-type-parameter': 'off', // TODO check if this is justified, reduce is just weird
    '@typescript-eslint/no-confusing-void-expression': 'off',
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          camelCase: true,
          pascalCase: true,
        },
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/', '.turbo/', '.coverage/'],
};
