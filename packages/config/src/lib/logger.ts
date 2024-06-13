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

  private log(message: string): void {
    // biome-ignore lint/suspicious/noConsoleLog: we allow console.log in this setting
    console.log(message);
  }

  debug(message: string): void {
    if (this.shouldLog('debug')) this.log(chalk.dim(message));
  }

  info(message: string): void {
    if (this.shouldLog('info')) this.log(chalk.cyan(message));
  }

  warn(message: string): void {
    if (this.shouldLog('warn')) console.warn(chalk.yellow(message));
  }

  error(message: string): void {
    if (this.shouldLog('error')) console.error(chalk.bold.red(message));
  }

  fatal(message: string): void {
    this.error(message);
    process.exit(1);
  }

  write(message: string): void {
    this.log(message);
  }
}

// TODO init with appropriate level
export const logger = new Logger('debug');
