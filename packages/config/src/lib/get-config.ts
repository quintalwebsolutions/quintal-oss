// biome-ignore lint/nursery/noNodejsModules: this code will run in a Node.js context
import fs from 'node:fs/promises';
// biome-ignore lint/nursery/noNodejsModules: this code will run in a Node.js context
import path from 'node:path';
import type { ConfigOptions } from './define-config';
import { logger } from './logger';

let cachedConfig: ConfigOptions<object> | null = null;

export async function getConfig(): Promise<ConfigOptions<object> | null> {
  logger.debug('Loading config file');

  if (cachedConfig) {
    logger.debug('Config cache hit');
    return cachedConfig;
  }
  logger.debug('Config cache miss');

  const configFilePath = path.join(process.cwd(), 'config.ts');
  const outputFilePath = path.join(process.cwd(), `config-${new Date().toISOString()}.js`);

  logger.debug(`Transpiling config file at ${configFilePath}`);
  const { $ } = await import('execa');
  const output =
    await $`esbuild ${configFilePath} --bundle --platform=node --target=node20 --outfile=${outputFilePath}`;

  if (output.exitCode !== 0) {
    logger.error('Something went wrong while transpiling the config file');
    return null;
  }

  logger.debug(`Loading transpiled config file at ${outputFilePath}`);
  const configModule = await import(`file://${outputFilePath}`);

  logger.debug('Deleting transpiled config file');
  await fs.unlink(outputFilePath);

  cachedConfig = configModule.default.default;
  logger.debug('Config file loaded and cached');

  return cachedConfig;
}
