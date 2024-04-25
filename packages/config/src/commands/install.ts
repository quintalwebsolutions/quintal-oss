import { $, execa } from 'execa';
import ora from 'ora';
import {
  DependencyStatus,
  PackageManagerName,
  detectPackageManager,
  getDependencies,
  logger,
} from '../';

function getProdInstallCommand(
  packageManager: PackageManagerName,
  dependencies: DependencyStatus[],
): string {
  const d = dependencies.reduce((prev, curr) => {
    if (curr.status.type !== 'unsatisfied') return prev;
    return `${prev} '${curr.name}@${curr.status.wanted.version}'`;
  }, '');

  switch (packageManager) {
    case 'npm':
      return `${packageManager} install${d}`;
    case 'bun':
    case 'pnpm':
    case 'yarn':
      return `${packageManager} add${d}`;
  }
}

function getDevInstallCommand(
  packageManager: PackageManagerName,
  dependencies: DependencyStatus[],
): string {
  const prodInstallCommand = getProdInstallCommand(packageManager, dependencies);
  return `${prodInstallCommand} -D`;
}

export async function install(): Promise<void> {
  const dependencies = await getDependencies();

  const conflictingDeps = dependencies.filter((d) => d.status.type === 'conflicting');
  if (conflictingDeps.length === 1)
    logger.warn(
      'There is 1 conflicting dependency in your configs. See why by running `quintal-config list`.',
    );
  else if (conflictingDeps.length > 0)
    logger.warn(
      `There are ${conflictingDeps.length} conflicting dependencies in your configs. See why by running \`quintal-config list\`.`,
    );

  if (conflictingDeps.length > 0)
    logger.warn(`Skipping installing ${conflictingDeps.map((d) => `'${d.name}'`).join(', ')}`);

  const prodDeps = dependencies.filter(
    (d) => d.status.type === 'unsatisfied' && d.status.wanted.type === 'prod',
  );

  const devDeps = dependencies.filter(
    (d) => d.status.type === 'unsatisfied' && d.status.wanted.type === 'dev',
  );

  if (prodDeps.length === 0 && devDeps.length === 0) {
    logger.info('Nothing to install, no unsatisfied dependencies found');
    return;
  }

  const packageManager = await detectPackageManager();

  const spinner = ora().start();

  if (prodDeps.length > 0) {
    const command = getProdInstallCommand(packageManager, prodDeps);
    logger.debug(`Prod install command: ${command}`);
    spinner.text = `Installing prod dependencies ${prodDeps.map((d) => `'${d.name}'`).join(', ')}`;
    await $`${command}`;
  } else logger.debug('No unsatisfied prod dependencies found');

  if (devDeps.length > 0) {
    const command = getDevInstallCommand(packageManager, devDeps);
    logger.debug(`Dev install command: ${command}`);
    spinner.text = `Installing dev dependencies ${devDeps.map((d) => `'${d.name}'`).join(', ')}`;
    console.log(await $`pnpm add 'eslint@^3.0.0' -D`);
    // await $`${command}`;
  } else logger.debug('No unsatisfied dev dependencies found');

  spinner.succeed('Installation complete');
}
