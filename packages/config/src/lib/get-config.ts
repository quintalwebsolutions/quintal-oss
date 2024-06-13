import fs from 'node:fs/promises';
import path from 'node:path';
import { $ } from 'execa';
import { logger } from './logger';
import type { RootConfig } from './root-config';

let cachedConfig: RootConfig<object> | null = null;

export async function getConfig(): Promise<RootConfig<object> | null> {
  logger.debug('Loading config file');

  if (cachedConfig) {
    logger.debug('Config cache hit');
    return cachedConfig;
  }
  logger.debug('Config cache miss');

  // TODO this assumes that the command was run in the same directory as the package.json
  // TODO allow the location of the config file to be specified through CLI options
  const configFilePath = path.join(process.cwd(), 'config.ts');
  const id = new Date().toISOString().replace(/[-:.TZ]/gm, '');
  const outputFilePath = path.join(process.cwd(), `config-${id}.js`);

  // TODO check if there even is a config.ts file before transpiling

  logger.debug(`Transpiling config file at ${configFilePath}`);

  // TODO run tsc to type-check config file
  const output =
    await $`esbuild ${configFilePath} --bundle --platform=node --target=node20 --outfile=${outputFilePath}`;

  if (output.exitCode !== 0) {
    logger.error('Something went wrong while transpiling the config file');
    return null;
  }

  logger.debug(`Loading transpiled config file at ${outputFilePath}`);
  const configModule = await import(outputFilePath);

  logger.debug('Deleting transpiled config file');
  await fs.unlink(outputFilePath);

  // TODO validate config file shape (+ no duplicate configs)

  cachedConfig = configModule.default.default;
  logger.info(`Loaded config file from ${configFilePath}`);

  return cachedConfig;
}
