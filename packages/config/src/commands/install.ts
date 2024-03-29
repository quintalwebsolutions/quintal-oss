import { detectPackageManager, getConfig, logger } from '../';

export async function install(): Promise<void> {
  logger.debug('Start command `install`');

  const config = await getConfig();

  const packageManager = await detectPackageManager();

  logger.debug('End command `install`');
}
