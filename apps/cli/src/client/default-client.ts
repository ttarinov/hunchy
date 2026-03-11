import { FirebaseApp } from "firebase/app";
import { ref, set, onValue, off, Database, DataSnapshot } from "firebase/database";
import { Auth, signInWithCustomToken } from "firebase/auth";
import { ConfigManager } from "../auth/config-manager.js";
import { BackendClient } from "./client.js";
import type { SessionRequest, ProgressUpdate, SessionResult, DeviceAuthResult } from "../types/client.js";
import { BackendError, ConfigError, TimeoutError } from "../utils/errors.js";
import { initializeFirebase } from "./firebase-initializer.js";
import { DeviceAuthHandler } from "./device-auth-handler.js";
export class DefaultClient implements BackendClient {
  private app: FirebaseApp | null = null;
  private database: Database | null = null;
  private auth: Auth | null = null;
  private configManager: ConfigManager;
  private deviceAuthHandler: DeviceAuthHandler | null = null;
  constructor() {
    this.configManager = new ConfigManager();
  }
  getConfigManager(): ConfigManager {
    return this.configManager;
  }
  async initialize(): Promise<void> {
    const services = await initializeFirebase(this.configManager);
    this.app = services.app;
    this.database = services.database;
    this.auth = services.auth;
    const cliAuthPath = await this.getCliAuthPath();
    this.deviceAuthHandler = new DeviceAuthHandler(this.database, cliAuthPath);
  }
  async getCliAuthPath(): Promise<string> {
    const isLocalMode = process.env.HUNCHY_LOCAL_MODE === "true" || process.env.HUNCHY_USE_EMULATORS === "true";
    if (isLocalMode) {
      const config = await this.configManager.getAppConfig();
      if (config?.paths?.cliAuth) {
        return config.paths.cliAuth;
      }
      return "cliAuth";
    }
    const config = await this.configManager.getAppConfig();
    if (!config?.paths?.cliAuth) {
      throw new ConfigError("Configuration incomplete. Database path missing. Please run 'hunchy auth' to authenticate.");
    }
    return config.paths.cliAuth;
  }
  async getSessionsPath(): Promise<string> {
    const config = await this.configManager.getAppConfig();
    if (!config?.paths?.sessions) {
      throw new ConfigError("Configuration incomplete. Sessions path missing. Please run 'hunchy auth' to authenticate.");
    }
    return config.paths.sessions;
  }
  async authenticate(idToken: string, customToken?: string): Promise<string> {
    if (!this.auth) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const tokenToUse = customToken || idToken;
    const userCredential = await signInWithCustomToken(this.auth, tokenToUse);
    const actualIdToken = await userCredential.user.getIdToken();
    return actualIdToken;
  }
  generateDeviceCode(): string {
    if (!this.deviceAuthHandler) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    return this.deviceAuthHandler.generateDeviceCode();
  }
  async createDeviceAuthEntry(deviceCode: string, expiresIn: number = 600): Promise<void> {
    if (!this.deviceAuthHandler) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    await this.deviceAuthHandler.createDeviceAuthEntry(deviceCode, expiresIn);
  }
  async pollDeviceAuth(
    deviceCode: string,
    interval: number = 2,
    maxAttempts: number = 300
  ): Promise<DeviceAuthResult> {
    if (!this.deviceAuthHandler) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    return this.deviceAuthHandler.pollDeviceAuth(deviceCode, interval, maxAttempts);
  }
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  async writeRequest(sessionId: string, request: SessionRequest): Promise<void> {
    if (!this.database) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const sessionsPath = await this.getSessionsPath();
    const requestRef = ref(this.database, `${sessionsPath}/${sessionId}/request`);
    await set(requestRef, request);
  }
  async subscribeToProgress(
    sessionId: string,
    callback: (progress: ProgressUpdate) => void
  ): Promise<() => void> {
    if (!this.database) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const sessionsPath = await this.getSessionsPath();
    const progressRef = ref(this.database, `${sessionsPath}/${sessionId}/progress`);
    const unsubscribe = onValue(progressRef, (snapshot: DataSnapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
    return () => off(progressRef);
  }
  async waitForResult(sessionId: string, timeoutMs: number = 60000): Promise<SessionResult> {
    if (!this.database) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const sessionsPath = await this.getSessionsPath();
    const resultRef = ref(this.database, `${sessionsPath}/${sessionId}/result`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        off(resultRef);
        reject(new TimeoutError("Request timeout"));
      }, timeoutMs);
      const unsubscribe = onValue(resultRef, (snapshot: DataSnapshot) => {
        const data = snapshot.val();
        if (data) {
          clearTimeout(timeout);
          off(resultRef);
          resolve(data);
        }
      });
    });
  }
  async cleanup(sessionId: string): Promise<void> {
    if (!this.database) {
      return;
    }
    const sessionsPath = await this.getSessionsPath();
    const sessionRef = ref(this.database, `${sessionsPath}/${sessionId}`);
    await set(sessionRef, null);
  }
  async isAvailable(): Promise<boolean> {
    try {
      const backendConfig = await this.configManager.getBackendConfig();
      return !!backendConfig;
    } catch {
      return false;
    }
  }
}
