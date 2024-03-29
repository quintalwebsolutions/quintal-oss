export type Dependency = { type: 'dev' | 'prod'; name: string; version: string };

export type Dependencies = Dependency[];

export type ConfigObject<TConfigShape extends object> = {
  name: string;
  dependencies: Dependencies;
  config: TConfigShape;
};

export type Config<TConfigShape extends object> = (
  config: TConfigShape,
) => ConfigObject<TConfigShape>;
