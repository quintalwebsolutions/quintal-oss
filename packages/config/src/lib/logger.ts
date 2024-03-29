import chalk from 'chalk';

export type LoggingLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private level: LoggingLevel;

  constructor(level: LoggingLevel) {
    this.level = level;
  }

  private shouldLog(level: LoggingLevel): boolean {
    const levels: LoggingLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.slice(0, levels.indexOf(level) + 1).includes(this.level);
  }

  debug(message: string): void {
    // biome-ignore lint/suspicious/noConsoleLog: we allow console.log in this setting
    if (this.shouldLog('debug')) console.log(chalk.dim(message));
  }

  info(message: string): void {
    // biome-ignore lint/suspicious/noConsoleLog: we allow console.log in this setting
    if (this.shouldLog('info')) console.log(chalk.cyan(message));
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) console.warn(chalk.yellow(message));
  }

  error(message: string): void {
    if (this.shouldLog('error')) console.error(chalk.bold.red(message));
  }

  write(message: string): void {
    // biome-ignore lint/suspicious/noConsoleLog: we allow console.log in this setting
    console.log(message);
  }
}

// TODO init with appropriate level
export const logger = new Logger('debug');

// const die = (errorOrMessage, instructions) => {
//   if (errorOrMessage instanceof Error) {
//     error(errorOrMessage.message);
//     info(errorOrMessage.stack);
//   } else {
//     error(errorOrMessage);
//     if (instructions) {
//       info(instructions);
//     }
//   }
//   process.exit(1);
// };
