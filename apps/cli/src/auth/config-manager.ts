import fs from "fs-extra";
import path from "path";
import os from "os";
import type {
  BackendConnectionConfig,
  PathsConfig,
  WebsiteConfig,
  AppConfig,
  AuthConfig,
} from "../types/auth.js";
export class ConfigManager {
  private configDir: string;
  private configPath: string;
  constructor() {
    this.configDir = path.join(os.homedir(), ".hunchy");
    this.configPath = path.join(this.configDir, "config.json");
  }
  async ensureConfigDir(): Promise<void> {
    await fs.ensureDir(this.configDir);
  }
  async load(): Promise<AuthConfig> {
    try {
      await this.ensureConfigDir();
      if (await fs.pathExists(this.configPath)) {
        const config = await fs.readJson(this.configPath);
        const hasSecurePermissions = await this.verifyPermissions();
        if (!hasSecurePermissions) {
          console.warn("Warning: Config file has insecure permissions. Consider running 'hunchy auth' again.");
        }
        return config;
      }
      return {};
    } catch (error) {
      return {};
    }
  }
  async save(config: AuthConfig): Promise<void> {
    await this.ensureConfigDir();
    await fs.writeJson(this.configPath, config, { spaces: 2 });
    await this.setSecurePermissions();
  }
  async setSecurePermissions(): Promise<void> {
    try {
      await fs.chmod(this.configPath, 0o600);
    } catch (error) {
      console.warn("Warning: Could not set secure file permissions");
    }
  }
  async verifyPermissions(): Promise<boolean> {
    try {
      const stats = await fs.stat(this.configPath);
      const mode = stats.mode & parseInt("777", 8);
      return mode === 0o600 || mode === 0o400;
    } catch {
      return true;
    }
  }
  private async get<K extends keyof AuthConfig>(key: K): Promise<AuthConfig[K]> {
    const config = await this.load();
    return config[key];
  }
  private async set<K extends keyof AuthConfig>(key: K, value: AuthConfig[K]): Promise<void> {
    const config = await this.load();
    config[key] = value;
    await this.save(config);
  }
  private async update(updater: (config: AuthConfig) => void): Promise<void> {
    const config = await this.load();
    updater(config);
    await this.save(config);
  }
  async getAuthToken(): Promise<string | undefined> {
    return this.get('authToken');
  }
  async setAuthToken(authToken: string): Promise<void> {
    await this.set('authToken', authToken);
  }
  async getRefreshToken(): Promise<string | undefined> {
    return this.get('refreshToken');
  }
  async setRefreshToken(refreshToken: string): Promise<void> {
    await this.set('refreshToken', refreshToken);
  }
  async getCustomToken(): Promise<string | undefined> {
    return this.get('customToken');
  }
  async setCustomToken(customToken: string): Promise<void> {
    await this.set('customToken', customToken);
  }
  async setUserId(userId: string): Promise<void> {
    await this.set('userId', userId);
  }
  async getUserEmail(): Promise<string | undefined> {
    return this.get('userEmail');
  }
  async setUserEmail(userEmail: string): Promise<void> {
    await this.set('userEmail', userEmail);
  }
  async getBackendConfig(): Promise<BackendConnectionConfig | undefined> {
    const config = await this.load();
    return config.config?.backend || config.backendConfig;
  }
  async setBackendConfig(backendConfig: BackendConnectionConfig): Promise<void> {
    await this.update(config => {
      config.backendConfig = backendConfig;
      if (!config.config) {
        throw new Error("Cannot set backend config without complete app config. Please run 'hunchy auth' to authenticate.");
      }
      config.config.backend = backendConfig;
    });
  }
  async getAppConfig(): Promise<AppConfig | undefined> {
    return this.get('config');
  }
  async setAppConfig(appConfig: AppConfig): Promise<void> {
    await this.update(config => {
      config.config = appConfig;
      config.backendConfig = appConfig.backend;
    });
  }
  async getPathsConfig(): Promise<PathsConfig | undefined> {
    const config = await this.load();
    return config.config?.paths;
  }
  async getWebsiteConfig(): Promise<WebsiteConfig | undefined> {
    const config = await this.load();
    return config.config?.website;
  }
  async getChatsPath(): Promise<string | undefined> {
    const config = await this.load();
    return config.config?.paths?.chats;
  }
  async getMessagesPath(): Promise<string | undefined> {
    const config = await this.load();
    return config.config?.paths?.messages;
  }
  async isConfigComplete(): Promise<boolean> {
    const config = await this.load();
    if (!config.config) {
      return false;
    }
    const { backend, paths, website } = config.config;
    return !!(
      backend?.apiKey &&
      backend?.authEndpoint &&
      backend?.serviceUrl &&
      backend?.project &&
      paths?.cliAuth &&
      paths?.sessions &&
      website?.url &&
      website?.authPath
    );
  }
  async isAuthenticated(): Promise<boolean> {
    const authToken = await this.getAuthToken();
    return !!authToken;
  }
  async clear(): Promise<void> {
    if (await fs.pathExists(this.configPath)) {
      await fs.remove(this.configPath);
    }
  }
  getConfigPath(): string {
    return this.configPath;
  }
}
