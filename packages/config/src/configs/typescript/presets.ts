import type { TypescriptConfigShape } from './config';

/** Options that only concern type-checking that should be shared across all config presets */
const typeCheckingOptions = {
  allowUnreachableCode: false,
  allowUnusedLabels: false,
  // alwaysStrict: true, // Enabled through `strict: true`
  // exactOptionalPropertyTypes: true, // Only option we don't set
  noFallthroughCasesInSwitch: true,
  // noImplicitAny: true, // Enabled through `strict: true`
  noImplicitOverride: true,
  noImplicitReturns: true,
  // noImplicitThis: true, // Enabled through `strict: true`
  noPropertyAccessFromIndexSignature: true,
  noUncheckedIndexedAccess: true,
  noUnusedLocals: true,
  noUnusedParameters: true,
  strict: true,
  // strictBindCallApply: true, // Enabled through `strict: true`
  // strictFunctionTypes: true, // Enabled through `strict: true`
  // strictNullChecks: true, // Enabled through `strict: true`
  // strictPropertyInitialization: true, // Enabled through `strict: true`
  // useUnknownInCatchVariables: true, // Enabled through `strict: true`
} satisfies TypescriptConfigShape['compilerOptions'];

/** General compiler options that should be shared across all config presets */
const sharedCompilerOptions = {
  ...typeCheckingOptions,
  baseUrl: '.',
  paths: {
    '@': ['./src'] as const,
    '@/*': ['./src/*'] as const,
  },
  resolveJsonModule: true,
  resolvePackageJsonExports: true,
  resolvePackageJsonImports: true,
  rootDir: '.' as const,
  newLine: 'LF' as const,
  allowJs: false,
  checkJs: true,
  allowSyntheticDefaultImports: true,
  esModuleInterop: true,
  forceConsistentCasingInFileNames: true,
  isolatedModules: true,
  noErrorTruncation: true,
} satisfies TypescriptConfigShape['compilerOptions'];

export const typescriptBasePreset = {
  include: ['**/*.ts', '**/*.tsx'],
  //   "exclude": [".coverage", ".coverage-ts", ".dist", ".turbo", "node_modules"]
  exclude: ['node_modules'],
  compilerOptions: {
    ...sharedCompilerOptions,
    module: 'nodenext',
    moduleResolution: 'nodenext',
    declaration: true,
    declarationMap: true,
    downlevelIteration: true,
    importHelpers: true,
    outDir: './dist',
    preserveConstEnums: true,
    sourceMap: true,
    verbatimModuleSyntax: true,
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    jsx: 'react-jsx',
    target: 'esnext',
    useDefineForClassFields: true,
  },
} satisfies TypescriptConfigShape;

export const typescriptNextjsPreset = {
  include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
  exclude: ['node_modules'],
  compilerOptions: {
    ...sharedCompilerOptions,
    module: 'esnext',
    moduleResolution: 'bundler',
    jsx: 'preserve',
    lib: ['dom', 'dom.iterable', 'esnext'],
    noEmit: true,
    skipLibCheck: true,
    incremental: true,
    plugins: [{ name: 'next' }],
  },
} satisfies TypescriptConfigShape;
