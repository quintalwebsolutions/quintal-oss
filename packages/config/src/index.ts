#!/usr/bin/env node

import { program } from '@commander-js/extra-typings';
import { description, version } from '../package.json';
import { generate, install, list } from './commands';

export * from './lib';
export * from './configs';

program
  .name('quintal-config')
  .description(description)
  .version(version, '-v --version')
  .showHelpAfterError();

program
  .command('install')
  .description('install packages required to use the specified configuration')
  .action(() => install());

program
  .command('generate')
  .description('generate configuration files')
  .action(() => generate());

program
  .command('list')
  .description('list the configurations and which dependencies are associated with them')
  .action(() => list());

async function main(): Promise<void> {
  await program.parseAsync(process.argv);
}

if (require.main === module)
  main()
    .then()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
