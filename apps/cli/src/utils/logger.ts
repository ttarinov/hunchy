import chalk from 'chalk';
import gradient from 'gradient-string';
import { getErrorMessage } from './error-utils.js';
interface LogOptions {
  prefix?: string;
  newlineBefore?: boolean;
  newlineAfter?: boolean;
}
class Logger {
  private debugEnabled = process.env.DEBUG === 'true';
  info(message: string, opts: LogOptions = {}): void {
    this.log('ℹ', chalk.cyan(message), opts);
  }
  success(message: string, opts: LogOptions = {}): void {
    this.log('✓', chalk.green(message), opts);
  }
  error(message: string, opts: LogOptions = {}): void {
    this.log('✗', chalk.red(message), opts);
  }
  warning(message: string, opts: LogOptions = {}): void {
    this.log('⚠', chalk.yellow(message), opts);
  }
  debug(message: string, opts: LogOptions = {}): void {
    if (!this.debugEnabled) return;
    this.log('🐛', chalk.gray(message), opts);
  }
  dim(message: string, opts: LogOptions = {}): void {
    this.log('', chalk.gray(message), opts);
  }
  plain(message: string, opts: LogOptions = {}): void {
    this.log('', message, opts);
  }
  brand(message: string): void {
    const blueGradient = gradient(['#0ea5e9', '#06b6d4']);
    console.log(blueGradient(message));
  }
  blank(): void {
    console.log();
  }
  logError(title: string, error?: unknown, suggestion?: string): void {
    this.error(title, { newlineBefore: true });
    if (error) {
      const errorMessage = getErrorMessage(error);
      console.log(chalk.gray('   Error: ') + chalk.yellow(errorMessage));
    }
    if (suggestion) {
      console.log(chalk.gray('   ') + suggestion);
    }
    this.blank();
  }
  logAuthError(error?: unknown): void {
    this.logError('Not authenticated', error);
    console.log(chalk.gray('   Please authenticate first with ') + chalk.cyan('/auth') + chalk.gray(' or ') + chalk.cyan('hunchy auth'));
    this.blank();
  }
  logChatError(error?: unknown): void {
    this.logError('Chat not available', error);
    console.log(chalk.gray('   Please authenticate first with ') + chalk.cyan('/auth') + chalk.gray(' or ') + chalk.cyan('hunchy auth'));
    this.blank();
  }
  logBackendError(error?: unknown): void {
    this.logError('Backend error', error, 'Please check your internet connection and try again.');
  }
  withPrefix(prefix: string): PrefixedLogger {
    return new PrefixedLogger(prefix, this);
  }
  private log(symbol: string, message: string, opts: LogOptions): void {
    let output = '';
    if (opts.newlineBefore) output += '\n';
    if (opts.prefix) output += chalk.gray(`[${opts.prefix}] `);
    if (symbol) output += symbol + ' ';
    output += message;
    if (opts.newlineAfter) output += '\n';
    console.log(output);
  }
}
class PrefixedLogger {
  constructor(private prefix: string, private logger: Logger) {}
  info(message: string, opts: Omit<LogOptions, 'prefix'> = {}): void {
    this.logger.info(message, { ...opts, prefix: this.prefix });
  }
  success(message: string, opts: Omit<LogOptions, 'prefix'> = {}): void {
    this.logger.success(message, { ...opts, prefix: this.prefix });
  }
  error(message: string, opts: Omit<LogOptions, 'prefix'> = {}): void {
    this.logger.error(message, { ...opts, prefix: this.prefix });
  }
  warning(message: string, opts: Omit<LogOptions, 'prefix'> = {}): void {
    this.logger.warning(message, { ...opts, prefix: this.prefix });
  }
  debug(message: string, opts: Omit<LogOptions, 'prefix'> = {}): void {
    this.logger.debug(message, { ...opts, prefix: this.prefix });
  }
  dim(message: string, opts: Omit<LogOptions, 'prefix'> = {}): void {
    this.logger.dim(message, { ...opts, prefix: this.prefix });
  }
  plain(message: string, opts: Omit<LogOptions, 'prefix'> = {}): void {
    this.logger.plain(message, { ...opts, prefix: this.prefix });
  }
}
export const logger = new Logger();
