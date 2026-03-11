import type { ConfigManager } from '../auth/config-manager.js';
import { AuthError, ConfigError } from './errors.js';
import { displayAuthError, displayConfigError } from './error-display.js';
export async function requireAuth(configManager: ConfigManager): Promise<void> {
  const authToken = await configManager.getAuthToken();
  if (!authToken) {
    displayAuthError(new AuthError('Not authenticated'));
    process.exit(1);
  }
}
export async function requireConfig(configManager: ConfigManager): Promise<void> {
  const appConfig = await configManager.getAppConfig();
  if (!appConfig) {
    displayConfigError(new ConfigError('Configuration not found'));
    process.exit(1);
  }
}
export async function requireBackendConfig(
  configManager: ConfigManager
): Promise<void> {
  const backendConfig = await configManager.getBackendConfig();
  if (!backendConfig) {
    displayConfigError(new ConfigError('Backend configuration not found'));
    process.exit(1);
  }
}
export async function requireAuthAndConfig(
  configManager: ConfigManager
): Promise<void> {
  await requireAuth(configManager);
  await requireConfig(configManager);
}
export async function isAuthenticated(configManager: ConfigManager): Promise<boolean> {
  const authToken = await configManager.getAuthToken();
  return !!authToken;
}
export async function hasConfig(configManager: ConfigManager): Promise<boolean> {
  const appConfig = await configManager.getAppConfig();
  return !!appConfig;
}
