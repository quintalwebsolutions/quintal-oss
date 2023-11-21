module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'plugin:tailwindcss/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:prettier/recommended',
  ],
  settings: {
    'next': {
      rootDir: ['sites/*/', 'services/*/', 'packages/*/'],
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
    'tailwindcss': {
      callees: ['clsx', 'twMerge'],
      whitelist: ['hamburger', 'hamburger--chop', 'active', 'inner', 'bar'],
    },
  },
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    'import/no-named-as-default': 'off',
    'import/order': [
      'error',
      {
        'groups': [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'object',
          'type',
        ],
        'newlines-between': 'never',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  overrides: [
    {
      files: ['*.graphql'],
      extends: [
        'plugin:@graphql-eslint/operations-all',
        'plugin:prettier/recommended',
      ],
      rules: {
        '@graphql-eslint/alphabetize': 'off',
        '@graphql-eslint/match-document-filename': 'off',
        '@graphql-eslint/lone-executable-definition': 'off',
      },
    },
  ],
  ignorePatterns: [
    '*/.js',
    '*/.json',
    'node_modules',
    '__generated__',
    'public',
    'styles',
    '.next',
    '.turbo',
  ],
};
