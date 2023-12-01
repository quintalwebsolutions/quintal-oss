const { resolve } = require('node:path');

const project = resolve(process.cwd(), 'tsconfig.json');

module.exports = {
  extends: [
    '@vercel/style-guide/eslint/node',
    '@vercel/style-guide/eslint/typescript',
  ].map(require.resolve).concat([
    'next/core-web-vitals',
    'plugin:tailwindcss/recommended',
    'plugin:prettier/recommended',
  ]),
  parserOptions: {
    project,
  },
  rules: {
    '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
    'prefer-named-capture-group': 'off',
    '@typescript-eslint/naming-convention': 'off', // TODO check how to configure this
    '@typescript-eslint/prefer-reduce-type-parameter': 'off', // TODO check if this is justified, reduce is just weird
    '@typescript-eslint/no-confusing-void-expression': 'off',
    'import/no-default-export': 'off', // TODO how to disable this only for layout, page, etc files
    'import/no-named-as-default': 'off', // TODO what even is this
    '@typescript-eslint/no-invalid-void-type': 'off',
    'unicorn/filename-case': 'off', // TODO how to disable this only for not-found, etc
    'import/no-extraneous-dependencies': 'off', // TODO how to disable for .prisma/client
    'no-useless-return': 'off', // TODO test this rule
    // TODO
    // 'unicorn/filename-case': [
    //   'error',
    //   {
    //     cases: {
    //       camelCase: true,
    //       pascalCase: true,
    //     },
    //   },
    // ],
  },
  settings: {
    'import/resolver': {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ['node_modules/', 'dist/', '.turbo/', '.coverage/', '.next/'],
};
