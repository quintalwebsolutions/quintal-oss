import type { ConfigObject } from './config';

export type RootConfig<TConfigShape extends object> = {
  configs: ConfigObject<TConfigShape>[];
};

export function defineRootConfig<TConfigShape extends object>(
  rootConfig: RootConfig<TConfigShape>,
): RootConfig<TConfigShape> {
  return rootConfig;
}
