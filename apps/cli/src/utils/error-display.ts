import chalk from 'chalk';
import { logger } from './logger.js';
import { getErrorMessage } from './error-utils.js';
export { getErrorMessage };
export function displayError(title: string, error?: unknown): void {
  logger.error(title, { newlineBefore: true });
  if (error) {
    const errorMessage = getErrorMessage(error);
    console.log(chalk.gray('   Error: ') + chalk.white(errorMessage));
  }
  logger.blank();
}
export function displayWarning(message: string): void {
  logger.warning(message, { newlineBefore: true, newlineAfter: true });
}
export function displayErrorWithContext(
  title: string,
  error: unknown,
  context: Record<string, any>
): void {
  logger.error(title, { newlineBefore: true });
  if (error) {
    const errorMessage = getErrorMessage(error);
    console.log(chalk.gray('   Error: ') + chalk.white(errorMessage));
  }
  Object.entries(context).forEach(([key, value]) => {
    const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
    console.log(chalk.gray(`   ${formattedKey}: `) + chalk.cyan(String(value)));
  });
  logger.blank();
}
export function displayAuthError(error: unknown): void {
  displayError('Not authenticated', error);
  console.log(chalk.gray('Please run: ') + chalk.cyan('hunchy auth'));
  logger.blank();
}
export function displayConfigError(error: unknown): void {
  displayError('Configuration error', error);
  console.log(
    chalk.gray('Please ensure you have the correct backend configuration.')
  );
  console.log(
    chalk.gray('If this is your first time, visit ') +
      chalk.cyan('https://hunchy-4a0dc.web.app') +
      chalk.gray(' to get started.')
  );
  logger.blank();
}
export function displayBackendError(error: unknown): void {
  displayError('Backend error', error);
  console.log(chalk.gray('Please check your internet connection and try again.'));
  logger.blank();
}
export function displayTimeoutError(operation: string): void {
  displayError(`${operation} timed out`);
  console.log(chalk.gray('Please try again or check your internet connection.'));
  logger.blank();
}
