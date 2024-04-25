import { defineRootConfig, typescriptConfig, typescriptNextjsPreset } from './src';

export default defineRootConfig({
  configs: [
    typescriptConfig(typescriptNextjsPreset),
    {
      ...typescriptConfig(typescriptNextjsPreset),
      name: 'Config 2',
      dependencies: [
        { name: 'typescript', type: 'prod', version: '1.0.0' },
        { name: 'eslint', type: 'dev', version: '^3.0.0' },
        { name: 'esbuild', type: 'prod', version: '~0.17.0' },
      ],
    },
    {
      ...typescriptConfig(typescriptNextjsPreset),
      name: 'Config 3',
      dependencies: [
        { name: 'esbuild', type: 'dev', version: '^0.17.0' },
        { name: 'execa', type: 'prod', version: '~8.0.0' },
      ],
    },
  ],
});
