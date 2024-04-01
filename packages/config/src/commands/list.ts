import chalk from 'chalk';
import { getDependencies, logger } from '../lib';

function writeName(dependency: Awaited<ReturnType<typeof getDependencies>>[number]): string {
  if (!dependency.current) return `[none] ${dependency.name}`;
  return `[${dependency.current.type}] ${dependency.name}@${dependency.current.version}`;
}

export async function list(): Promise<void> {
  logger.debug('Start command `list`');

  const dependencies = await getDependencies();

  const dash = chalk.dim('-');

  for (const d of dependencies) {
    switch (d.status.type) {
      case 'satisfied':
        logger.write(`${dash} ${chalk.greenBright(writeName(d))} is satisfied`);
        break;
      case 'unsatisfied':
        logger.write(
          `${dash} ${chalk.yellowBright(writeName(d))} is unsatisfied, wanted: ${
            d.status.wanted.type
          }@${d.status.wanted.version}`,
        );
        break;
      case 'conflicting':
        logger.write(
          `${dash} ${chalk.redBright(writeName(d))} has conflicting version ranges ${
            d.status.a.version
          } (from config: '${d.status.a.configName}') and ${d.status.b.version} (from config: '${
            d.status.b.configName
          }')`,
        );
        break;
    }
  }

  logger.debug('End command `list`');
}
