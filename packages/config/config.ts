import { defineConfig, typescriptConfig, typescriptNextjsPreset } from './src';

export default defineConfig({
  configs: [typescriptConfig(typescriptNextjsPreset)],
});
