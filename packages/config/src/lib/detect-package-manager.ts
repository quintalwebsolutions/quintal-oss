import fs from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'execa';
import { logger } from './logger';

export type PackageManagerName = 'npm' | 'yarn' | 'pnpm' | 'bun';

type PackageManager = { name: PackageManagerName; lockFile: string };

async function pathExists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function packageManagerIsInstalled(packageManagerName: PackageManagerName): Promise<boolean> {
  try {
    const output = await $`${packageManagerName} --version`;
    return /^\d+.\d+.\d+$/.test(output.stdout);
  } catch {
    return false;
  }
}

async function getByPredicate(
  predicate: (packageManager: PackageManager) => Promise<boolean>,
): Promise<PackageManagerName | null> {
  const packageManagers: PackageManager[] = [
    { name: 'npm', lockFile: 'package-lock.json' },
    { name: 'yarn', lockFile: 'yarn.lock' },
    { name: 'pnpm', lockFile: 'pnpm-lock.yaml' },
    { name: 'bun', lockFile: 'bun.lockb' },
  ];
  const predicateResolved = await Promise.all(packageManagers.map(predicate));
  const packageManagerIndex = predicateResolved.findIndex((pm) => pm);
  return packageManagers[packageManagerIndex]?.name ?? null;
}

async function scanPackageManager(): Promise<PackageManagerName | null> {
  logger.debug('Detecting package manager');

  for (let depth = 0; depth < 5; depth++) {
    const dir = path.join(...Array(depth).fill('..'));
    logger.debug(`Searching for lockfile in '${dir}'`);
    const found = await getByPredicate((pm) => pathExists(path.join(dir, pm.lockFile)));
    if (found) return found;
  }

  logger.debug('No lockfile found, trying global installations');
  return await getByPredicate((pm) => packageManagerIsInstalled(pm.name));
}

export async function detectPackageManager() {
  const packageManager = await scanPackageManager();

  if (packageManager) logger.info(`Detected package manager "${packageManager}"`);
  else logger.error('No package manager detected, selecting npm as default');

  return packageManager ?? 'npm';
}
