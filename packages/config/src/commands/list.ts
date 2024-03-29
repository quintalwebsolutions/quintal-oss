import chalk from 'chalk';
import { getConfig, logger } from '../lib';

export async function list(): Promise<void> {
  logger.debug('Start command `list`');

  const config = await getConfig();

  if (!config || config.configs.length === 0) {
    logger.warn('No configurations found');
    return;
  }

  // TODO group by dev and prod deps, not config name, group shared dependencies and check semver compatibility
  // TODO report if the deps have been installed and the version requirements suffice
  for (const c of config.configs) {
    logger.info(`Config "${c.name}" has dependencies:`);
    for (const d of c.dependencies) {
      logger.write(`${chalk.dim('-')} ${chalk.cyan(`[${d.type}]`)} ${d.name}@${d.version}`);
    }
  }

  logger.debug('End command `list`');
}
