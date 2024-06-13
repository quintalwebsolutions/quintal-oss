import fs from 'node:fs/promises';
import path from 'node:path';
import semver from 'semver';
import type { ConfigObject, DependencyType } from './config';
import { getConfig } from './get-config';
import { logger } from './logger';

type ConfigDependency = { configName: string; version: string; type: DependencyType };

type HeadlessDependency = Pick<ConfigDependency, 'version' | 'type'>;

type PackageJsonDependencies = Record<string, HeadlessDependency>;

export type DependencyStatus = {
  name: string;
  current: HeadlessDependency | null;
  wanted: ConfigDependency[];
  status:
    | { type: 'satisfied' }
    | { type: 'unsatisfied'; wanted: HeadlessDependency }
    | { type: 'conflicting'; a: ConfigDependency; b: ConfigDependency };
};

type MappedDependency = Pick<DependencyStatus, 'current' | 'wanted'>;

type DependencyMap = Record<string, MappedDependency>;

async function getPackageJsonDependencies(): Promise<PackageJsonDependencies> {
  // TODO this assumes that the command was run in the same directory as the package.json
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  logger.debug(`Reading package.json file at ${packageJsonPath}`);

  const packageJsonContent = await fs.readFile(packageJsonPath, 'utf-8');
  // TODO validate package.json before parsing / using it
  const packageJson = JSON.parse(packageJsonContent);
  const dependencies = (packageJson.dependencies ?? {}) as Record<string, string>;
  const devDependencies = (packageJson.devDependencies ?? {}) as Record<string, string>;

  const reduceDeps = (deps: Record<string, string>, type: DependencyType) =>
    Object.entries(deps).reduce((prev, [name, version]) => {
      prev[name] = { type, version };
      return prev;
    }, {} as PackageJsonDependencies);

  return { ...reduceDeps(devDependencies, 'dev'), ...reduceDeps(dependencies, 'prod') };
}

function mapDependencies(
  configs: ConfigObject<object>[],
  deps: PackageJsonDependencies,
): DependencyMap {
  const dependencyMap: DependencyMap = {};
  for (const c of configs) {
    for (const d of c.dependencies) {
      const mapEntry = dependencyMap[d.name];
      if (!mapEntry)
        dependencyMap[d.name] = {
          current: deps[d.name] ?? null,
          wanted: [{ configName: c.name, version: d.version, type: d.type }],
        };
      else mapEntry.wanted.push({ configName: c.name, version: d.version, type: d.type });
    }
  }
  return dependencyMap;
}

function findFirstConflictingSemver(
  dependencies: ConfigDependency[],
): [ConfigDependency, ConfigDependency] | null {
  for (let i = 0; i < dependencies.length; i++) {
    for (let j = i + 1; j < dependencies.length; j++) {
      // biome-ignore lint/style/noNonNullAssertion: We can assert this due to the for loop logic
      const [a, b] = [dependencies[i]!, dependencies[j]!];
      if (!semver.intersects(a.version, b.version)) return [a, b];
    }
  }
  return null;
}

function evaluateDependency(name: string, dep: MappedDependency): DependencyStatus {
  const dependency: DependencyStatus = { ...dep, name, status: { type: 'satisfied' } };

  // Check all configs if the dependency version ranges are compatible with each other
  const conflicting = findFirstConflictingSemver(dependency.wanted);
  if (conflicting) {
    const [a, b] = conflicting;
    dependency.status = { type: 'conflicting', a, b };
    logger.debug(
      `Dependency '${name}' has conflicting versions ${a.version} (from config '${a.configName}') and ${b.version} (from config '${b.configName}')`,
    );
    return dependency;
  }

  // Check for installed version if its version is compatible with the wanted version
  // TODO better way to find wanted version?
  const wantedVersion = dependency.wanted.map((d) => d.version).join(' || ');
  const wantedType = dependency.wanted.reduce(
    (prev, curr) => ([prev, curr.type].includes('prod') ? 'prod' : 'dev'),
    'dev' as DependencyType,
  );

  if (
    !dependency.current ||
    dependency.current.type !== wantedType ||
    !semver.satisfies(dependency.current.version, wantedVersion)
  ) {
    dependency.status = {
      type: 'unsatisfied',
      wanted: { type: wantedType, version: wantedVersion },
    };
    logger.debug(
      `Dependency '${name}' is unsatisfied, ${
        dependency.current
          ? `current: ${dependency.current.type}@${dependency.current.version}`
          : 'currently not installed'
      }, wanted: ${wantedType}@${wantedVersion}`,
    );
    return dependency;
  }

  logger.debug(`Dependency '${name}' is satisfied`);
  return dependency;
}

function evaluateDependencies(dependencyMap: DependencyMap): DependencyStatus[] {
  return Object.entries(dependencyMap)
    .reduce((prev, [name, dependency]) => {
      prev.push(evaluateDependency(name, dependency));
      return prev;
    }, [] as DependencyStatus[])
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function getDependencies(): Promise<DependencyStatus[]> {
  logger.debug('Scanning dependencies');

  const config = await getConfig();
  const configs = config?.configs.filter((c) => c.dependencies.length > 0) ?? [];
  if (configs.length === 0) {
    logger.warn('No dependencies found in listed configs');
    return [];
  }

  const deps = await getPackageJsonDependencies();
  const dependencyMap = mapDependencies(configs, deps);
  return evaluateDependencies(dependencyMap);
}
