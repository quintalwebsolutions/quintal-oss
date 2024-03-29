import type { ConfigObject } from './config';

export type ConfigOptions<TConfigShape extends object> = {
  configs: ConfigObject<TConfigShape>[];
};

export function defineConfig<TConfigShape extends object>(
  configOptions: ConfigOptions<TConfigShape>,
): ConfigOptions<TConfigShape> {
  return configOptions;
}
