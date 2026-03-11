import { ConfigManager } from "./config-manager.js";
import type { AppConfig } from "../types/auth.js";
import { BackendClient } from "../client/client.js";
import { DefaultClient } from "../client/default-client.js";
import { ConfigError, AuthError, TimeoutError } from "../utils/errors.js";
import { WEBSITE_URL, AUTH_PAGE_PATH, POLL_INTERVAL, MAX_POLL_ATTEMPTS } from "../utils/constants.js";
import { callFunction } from "../utils/functions-client.js";
export interface DeviceAuthResponse {
  deviceCode: string;
  userCode: string;
  verificationUri: string;
  expiresIn: number;
  interval: number;
}
export interface TokenResponse {
  idToken: string;
  refreshToken: string;
  userId: string;
  email?: string;
  customToken?: string;
  config?: AppConfig;
}
export class ApiClient {
  private configManager: ConfigManager;
  private backendClient: BackendClient;
  constructor(backendClient?: BackendClient) {
    this.configManager = new ConfigManager();
    this.backendClient = backendClient || new DefaultClient();
  }
  async getVerificationUri(): Promise<string> {
    const isLocalMode = process.env.HUNCHY_LOCAL_MODE === "true" || process.env.HUNCHY_USE_EMULATORS === "true";
    const websiteUrl = process.env.HUNCHY_WEBSITE_URL || (isLocalMode ? "http://localhost:3000" : WEBSITE_URL);
    return `${websiteUrl}${AUTH_PAGE_PATH}`;
  }
  private generateDeviceCode(): string {
    const { getStableDeviceId } = require("../utils/device-id.js");
    return getStableDeviceId();
  }
  async initialize(): Promise<void> {
    await this.backendClient.initialize();
  }
  async startDeviceAuth(): Promise<DeviceAuthResponse> {
    const deviceCode = this.generateDeviceCode();
    const expiresIn = 600;
    await callFunction("initCliAuth", { deviceCode, expiresIn });
    const verificationUri = await this.getVerificationUri();
    return {
      deviceCode,
      userCode: deviceCode.substring(0, 8),
      verificationUri,
      expiresIn,
      interval: POLL_INTERVAL,
    };
  }
  async pollForToken(
    deviceCode: string,
    interval: number = POLL_INTERVAL,
    maxAttempts: number = MAX_POLL_ATTEMPTS
  ): Promise<TokenResponse> {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const result = await callFunction<any>("pollCliAuth", { deviceCode });
        if (result.status === "expired") {
          throw new AuthError("Authentication expired. Please try again.");
        }
        if (result.status === "completed" && result.config) {
          return {
            idToken: result.idToken,
            refreshToken: result.refreshToken || "",
            userId: result.userId || "",
            email: result.email || "",
            customToken: result.customToken,
            config: result.config,
          };
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
        attempts++;
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }
        if (attempts >= maxAttempts - 1) {
          throw new TimeoutError("Authentication timeout. Please try again.");
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
        attempts++;
      }
    }
    throw new TimeoutError("Authentication timeout. Please try again.");
  }
  async setTokens(tokenResponse: TokenResponse): Promise<void> {
    await this.configManager.setAuthToken(tokenResponse.idToken);
    if (tokenResponse.refreshToken) {
      await this.configManager.setRefreshToken(tokenResponse.refreshToken);
    }
    if (tokenResponse.customToken) {
      await this.configManager.setCustomToken(tokenResponse.customToken);
    }
    if (tokenResponse.userId) {
      await this.configManager.setUserId(tokenResponse.userId);
    }
    if (tokenResponse.config) {
      await this.configManager.setAppConfig(tokenResponse.config);
    }
  }
  async logout(): Promise<void> {
    await this.configManager.clear();
  }
  async isAuthenticated(): Promise<boolean> {
    return await this.configManager.isAuthenticated();
  }
  async getAuthToken(): Promise<string | undefined> {
    return await this.configManager.getAuthToken();
  }
  getConfigManager(): ConfigManager {
    return this.configManager;
  }
  getBackendClient(): BackendClient {
    return this.backendClient;
  }
  getDefaultClient(): DefaultClient | null {
    if (this.backendClient instanceof DefaultClient) {
      return this.backendClient;
    }
    return null;
  }
}
