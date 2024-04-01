import { detectPackageManager, getDependencies, logger } from '../';

export async function install(): Promise<void> {
  logger.debug('Start command `install`');

  // const ora = await import('ora');
  // const spinner = ora('Loading unicorns').start();

  const packageManager = await detectPackageManager();

  const dependencies = await getDependencies();

  // setTimeout(() => {
  //   spinner.succeed('Unicorns loaded successfully');
  // });

  logger.debug('End command `install`');
}
