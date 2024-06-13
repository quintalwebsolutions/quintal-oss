#!/usr/bin/env node

import { program } from 'commander';
import esMain from 'es-main';
import { description, version } from '../package.json';
import { generate, install, list } from './commands';
import { logger } from './lib';

export * from './lib';
export * from './configs';

async function command(name: string, action: () => Promise<void>): Promise<void> {
  logger.info(`quintal-config v${version}`);
  logger.debug(`Start command '${name}'`);
  await action();
  logger.debug(`End command '${name}'`);
}

program
  .name('quintal-config')
  .description(description)
  .version(version, '-v --version')
  .showHelpAfterError();

program
  .command('install')
  .description('install packages required to use the specified configuration')
  .action(() => command('install', install));

program
  .command('generate')
  .description('generate configuration files')
  .action(() => command('generate', generate));

program
  .command('list')
  .description('list the configurations and which dependencies are associated with them')
  .action(() => command('list', list));

async function main(): Promise<void> {
  await program.parseAsync(process.argv);
}

const meta = import.meta.url ? import.meta : ({ url: 'file:///' } as ImportMeta);

if (esMain(meta))
  main()
    .then()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
