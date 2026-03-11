#!/usr/bin/env node
var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/index.ts
import { Command as Command4 } from "commander";
import { readFileSync as readFileSync3 } from "node:fs";
import { fileURLToPath as fileURLToPath3 } from "node:url";
import { dirname as dirname2, join as join3 } from "node:path";

// src/commands/auth-command.js
import { Command } from "commander";
import chalk from "chalk";
import open from "open";
import ora from "ora";

// src/auth/config-manager.js
import fs from "fs-extra";
import path from "node:path";
import os from "node:os";
var ConfigManager = class {
  static {
    __name(this, "ConfigManager");
  }
  configDir;
  configPath;
  constructor() {
    this.configDir = path.join(os.homedir(), ".hunchy");
    this.configPath = path.join(this.configDir, "config.json");
  }
  async ensureConfigDir() {
    await fs.ensureDir(this.configDir);
  }
  async load() {
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
  async save(config) {
    await this.ensureConfigDir();
    await fs.writeJson(this.configPath, config, { spaces: 2 });
    await this.setSecurePermissions();
  }
  async setSecurePermissions() {
    try {
      await fs.chmod(this.configPath, 384);
    } catch (error) {
      console.warn("Warning: Could not set secure file permissions");
    }
  }
  async verifyPermissions() {
    try {
      const stats = await fs.stat(this.configPath);
      const mode = stats.mode & parseInt("777", 8);
      return mode === 384 || mode === 256;
    } catch {
      return true;
    }
  }
  /**
   * Generic getter for config properties
   */
  async get(key) {
    const config = await this.load();
    return config[key];
  }
  /**
   * Generic setter for config properties
   */
  async set(key, value) {
    const config = await this.load();
    config[key] = value;
    await this.save(config);
  }
  /**
   * Generic updater for complex config updates
   */
  async update(updater) {
    const config = await this.load();
    updater(config);
    await this.save(config);
  }
  async getAuthToken() {
    return this.get("authToken");
  }
  async setAuthToken(authToken) {
    await this.set("authToken", authToken);
  }
  async getRefreshToken() {
    return this.get("refreshToken");
  }
  async setRefreshToken(refreshToken) {
    await this.set("refreshToken", refreshToken);
  }
  async getCustomToken() {
    return this.get("customToken");
  }
  async setCustomToken(customToken) {
    await this.set("customToken", customToken);
  }
  async setUserId(userId) {
    await this.set("userId", userId);
  }
  async getUserEmail() {
    return this.get("userEmail");
  }
  async setUserEmail(userEmail) {
    await this.set("userEmail", userEmail);
  }
  async getBackendConfig() {
    const config = await this.load();
    return config.config?.backend || config.backendConfig;
  }
  async setBackendConfig(backendConfig) {
    await this.update((config) => {
      config.backendConfig = backendConfig;
      if (!config.config) {
        throw new Error("Cannot set backend config without complete app config. Please run 'hunchy auth' to authenticate.");
      }
      config.config.backend = backendConfig;
    });
  }
  async getAppConfig() {
    return this.get("config");
  }
  async setAppConfig(appConfig) {
    await this.update((config) => {
      config.config = appConfig;
      config.backendConfig = appConfig.backend;
    });
  }
  async getPathsConfig() {
    const config = await this.load();
    return config.config?.paths;
  }
  async getWebsiteConfig() {
    const config = await this.load();
    return config.config?.website;
  }
  async getChatsPath() {
    const config = await this.load();
    return config.config?.paths?.chats;
  }
  async getMessagesPath() {
    const config = await this.load();
    return config.config?.paths?.messages;
  }
  async isConfigComplete() {
    const config = await this.load();
    if (!config.config) {
      return false;
    }
    const { backend, paths, website } = config.config;
    return !!(backend?.apiKey && backend?.authEndpoint && backend?.serviceUrl && backend?.project && paths?.cliAuth && paths?.sessions && website?.url && website?.authPath);
  }
  async isAuthenticated() {
    const authToken = await this.getAuthToken();
    return !!authToken;
  }
  async clear() {
    if (await fs.pathExists(this.configPath)) {
      await fs.remove(this.configPath);
    }
  }
  getConfigPath() {
    return this.configPath;
  }
};

// src/client/default-client.js
import { ref as ref2, set as set2, onValue, off } from "firebase/database";
import { signInWithCustomToken } from "firebase/auth";

// src/utils/errors.js
var AuthError = class extends Error {
  static {
    __name(this, "AuthError");
  }
  constructor(message) {
    super(message);
    this.name = "AuthError";
  }
};
var BackendError = class extends Error {
  static {
    __name(this, "BackendError");
  }
  constructor(message) {
    super(message);
    this.name = "BackendError";
  }
};
var ConfigError = class extends Error {
  static {
    __name(this, "ConfigError");
  }
  constructor(message) {
    super(message);
    this.name = "ConfigError";
  }
};
var TimeoutError = class extends Error {
  static {
    __name(this, "TimeoutError");
  }
  constructor(message) {
    super(message);
    this.name = "TimeoutError";
  }
};

// src/client/firebase-initializer.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// src/utils/emulator-config.js
import { connectAuthEmulator } from "firebase/auth";
import { connectDatabaseEmulator } from "firebase/database";
function shouldUseEmulators(serviceUrl) {
  if (process.env.HUNCHY_USE_EMULATORS === "true" || process.env.HUNCHY_LOCAL_MODE === "true") {
    return true;
  }
  if (serviceUrl) {
    return serviceUrl.includes("localhost") || serviceUrl.includes("127.0.0.1") || serviceUrl.includes("::1");
  }
  return false;
}
__name(shouldUseEmulators, "shouldUseEmulators");
async function connectToEmulators(auth, database) {
  if (!shouldUseEmulators()) {
    return;
  }
  try {
    const host = "localhost";
    try {
      connectAuthEmulator(auth, `http://${host}:9099`, {
        disableWarnings: true
      });
    } catch (error) {
    }
    try {
      const dbInfo = database._delegate?._repo?.repoInfo_?.host;
      if (!dbInfo?.includes("localhost")) {
        connectDatabaseEmulator(database, host, 9e3);
      }
    } catch (error) {
    }
  } catch (error) {
  }
}
__name(connectToEmulators, "connectToEmulators");

// src/client/firebase-initializer.js
async function initializeFirebase(configManager) {
  const isLocalMode = process.env.HUNCHY_LOCAL_MODE === "true" || process.env.HUNCHY_USE_EMULATORS === "true";
  let backendConfig = await configManager.getBackendConfig();
  if (isLocalMode && !backendConfig) {
    backendConfig = {
      apiKey: "AIzaSyDemoKeyForEmulatorUseOnly1234567890",
      authEndpoint: "localhost",
      serviceUrl: "http://localhost:9000",
      project: "demo-project"
    };
  }
  if (!backendConfig) {
    throw new AuthError("Not authenticated. Please run 'hunchy auth' or '/auth' command to authenticate and receive configuration.");
  }
  const useEmulators = isLocalMode || shouldUseEmulators(backendConfig.serviceUrl);
  if (useEmulators) {
    process.env.FIREBASE_AUTH_EMULATOR_HOST = "localhost:9099";
    process.env.FIREBASE_DATABASE_EMULATOR_HOST = "localhost:9000";
  }
  const firebaseConfig = {
    apiKey: useEmulators ? "AIzaSyDemoKeyForEmulatorUseOnly1234567890" : backendConfig.apiKey,
    authDomain: backendConfig.authEndpoint,
    databaseURL: backendConfig.serviceUrl,
    projectId: backendConfig.project
  };
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);
  if (useEmulators) {
    await connectToEmulators(auth, database);
  }
  return { app, database, auth };
}
__name(initializeFirebase, "initializeFirebase");

// src/client/device-auth-handler.js
import { ref, set, get } from "firebase/database";
var DeviceAuthHandler = class {
  static {
    __name(this, "DeviceAuthHandler");
  }
  database;
  cliAuthPath;
  constructor(database, cliAuthPath) {
    this.database = database;
    this.cliAuthPath = cliAuthPath;
  }
  generateDeviceCode() {
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  async createDeviceAuthEntry(deviceCode, expiresIn = 600) {
    const deviceRef = ref(this.database, `${this.cliAuthPath}/${deviceCode}`);
    const now = Date.now();
    await set(deviceRef, {
      status: "pending",
      createdAt: now,
      expiresAt: now + expiresIn * 1e3
    });
  }
  async pollDeviceAuth(deviceCode, interval = 2, maxAttempts = 300) {
    const deviceRef = ref(this.database, `${this.cliAuthPath}/${deviceCode}`);
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const snapshot = await get(deviceRef);
        const data = snapshot.val();
        if (!data) {
          throw new AuthError("Device code not found or expired");
        }
        if (data.status === "expired") {
          throw new AuthError("Authentication expired. Please try again.");
        }
        if (data.status === "completed" && data.idToken) {
          return {
            idToken: data.idToken,
            refreshToken: data.refreshToken || "",
            userId: data.userId || "",
            email: data.email || "",
            customToken: data.customToken,
            config: data.config
          };
        }
        if (data.expiresAt && data.expiresAt < Date.now()) {
          await set(deviceRef, { status: "expired" });
          throw new AuthError("Authentication expired. Please try again.");
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1e3));
        attempts++;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1e3));
        attempts++;
      }
    }
    throw new TimeoutError("Authentication timeout. Please try again.");
  }
};

// src/client/default-client.js
var DefaultClient = class {
  static {
    __name(this, "DefaultClient");
  }
  app = null;
  database = null;
  auth = null;
  configManager;
  //test
  deviceAuthHandler = null;
  constructor() {
    this.configManager = new ConfigManager();
  }
  getConfigManager() {
    return this.configManager;
  }
  async initialize() {
    const services = await initializeFirebase(this.configManager);
    this.app = services.app;
    this.database = services.database;
    this.auth = services.auth;
    const cliAuthPath = await this.getCliAuthPath();
    this.deviceAuthHandler = new DeviceAuthHandler(this.database, cliAuthPath);
  }
  async getCliAuthPath() {
    const isLocalMode = process.env.HUNCHY_LOCAL_MODE === "true" || process.env.HUNCHY_USE_EMULATORS === "true";
    if (isLocalMode) {
      const config2 = await this.configManager.getAppConfig();
      if (config2?.paths?.cliAuth) {
        return config2.paths.cliAuth;
      }
      return "cliAuth";
    }
    const config = await this.configManager.getAppConfig();
    if (!config?.paths?.cliAuth) {
      throw new ConfigError("Configuration incomplete. Database path missing. Please run 'hunchy auth' to authenticate.");
    }
    return config.paths.cliAuth;
  }
  async getSessionsPath() {
    const config = await this.configManager.getAppConfig();
    if (!config?.paths?.sessions) {
      throw new ConfigError("Configuration incomplete. Sessions path missing. Please run 'hunchy auth' to authenticate.");
    }
    return config.paths.sessions;
  }
  async authenticate(idToken, customToken) {
    if (!this.auth) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const tokenToUse = customToken || idToken;
    await signInWithCustomToken(this.auth, tokenToUse);
  }
  generateDeviceCode() {
    if (!this.deviceAuthHandler) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    return this.deviceAuthHandler.generateDeviceCode();
  }
  async createDeviceAuthEntry(deviceCode, expiresIn = 600) {
    if (!this.deviceAuthHandler) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    await this.deviceAuthHandler.createDeviceAuthEntry(deviceCode, expiresIn);
  }
  async pollDeviceAuth(deviceCode, interval = 2, maxAttempts = 300) {
    if (!this.deviceAuthHandler) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    return this.deviceAuthHandler.pollDeviceAuth(deviceCode, interval, maxAttempts);
  }
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
  async writeRequest(sessionId, request) {
    if (!this.database) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const sessionsPath = await this.getSessionsPath();
    const requestRef = ref2(this.database, `${sessionsPath}/${sessionId}/request`);
    await set2(requestRef, request);
  }
  async subscribeToProgress(sessionId, callback) {
    if (!this.database) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const sessionsPath = await this.getSessionsPath();
    const progressRef = ref2(this.database, `${sessionsPath}/${sessionId}/progress`);
    const unsubscribe = onValue(progressRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });
    return () => off(progressRef);
  }
  async waitForResult(sessionId, timeoutMs = 6e4) {
    if (!this.database) {
      throw new BackendError("Backend not initialized. Call initialize() first.");
    }
    const sessionsPath = await this.getSessionsPath();
    const resultRef = ref2(this.database, `${sessionsPath}/${sessionId}/result`);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        off(resultRef);
        reject(new TimeoutError("Request timeout"));
      }, timeoutMs);
      const unsubscribe = onValue(resultRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          clearTimeout(timeout);
          off(resultRef);
          resolve(data);
        }
      });
    });
  }
  async cleanup(sessionId) {
    if (!this.database) {
      return;
    }
    const sessionsPath = await this.getSessionsPath();
    const sessionRef = ref2(this.database, `${sessionsPath}/${sessionId}`);
    await set2(sessionRef, null);
  }
  async isAvailable() {
    try {
      const backendConfig = await this.configManager.getBackendConfig();
      return !!backendConfig;
    } catch {
      return false;
    }
  }
};

// src/utils/constants.js
var FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "hunchy-4a0dc";
var FIREBASE_REGION = "us-central1";
var isEmulator = process.env.HUNCHY_USE_EMULATORS === "true" || process.env.FIREBASE_EMULATOR_HUB !== void 0 || process.env.FIREBASE_AUTH_EMULATOR_HOST !== void 0 || process.env.FIREBASE_DATABASE_EMULATOR_HOST !== void 0;
var FUNCTIONS_BASE_URL = isEmulator ? `http://localhost:5001/${FIREBASE_PROJECT_ID}/${FIREBASE_REGION}` : `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net`;
var WEBSITE_URL = process.env.HUNCHY_WEBSITE_URL || (isEmulator ? "http://localhost:3000" : "https://hunchy-4a0dc.web.app");
var AUTH_PAGE_PATH = "/auth/cli";
var POLL_INTERVAL = 2;
var MAX_POLL_ATTEMPTS = 300;

// src/utils/functions-client.js
var getEmulatorUrl = /* @__PURE__ */ __name((functionName) => {
  return `http://localhost:5001/${FIREBASE_PROJECT_ID}/${FIREBASE_REGION}/${functionName}`;
}, "getEmulatorUrl");
var getProductionUrl = /* @__PURE__ */ __name((functionName) => {
  return `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/${functionName}`;
}, "getProductionUrl");
function isEmulatorMode() {
  return process.env.HUNCHY_LOCAL_MODE === "true" || process.env.HUNCHY_USE_EMULATORS === "true";
}
__name(isEmulatorMode, "isEmulatorMode");
async function callFunction(functionName, data = {}, idToken) {
  const isEmulator2 = isEmulatorMode();
  const url = isEmulator2 ? getEmulatorUrl(functionName) : getProductionUrl(functionName);
  const headers = {
    "Content-Type": "application/json"
  };
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ data })
    });
    if (!response.ok) {
      if (response.status === 404 && !isEmulator2) {
        const emulatorUrl = getEmulatorUrl(functionName);
        console.log(`Trying emulator at ${emulatorUrl}...`);
        const emulatorResponse = await fetch(emulatorUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ data })
        });
        if (emulatorResponse.ok) {
          const result2 = await emulatorResponse.json();
          return result2.result;
        }
      }
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `Function call failed: ${response.statusText}`);
    }
    const result = await response.json();
    return result.result;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
        if (!isEmulator2) {
          const emulatorUrl = getEmulatorUrl(functionName);
          try {
            const emulatorResponse = await fetch(emulatorUrl, {
              method: "POST",
              headers,
              body: JSON.stringify({ data })
            });
            if (emulatorResponse.ok) {
              const result = await emulatorResponse.json();
              return result.result;
            }
          } catch {
          }
        }
      }
      throw error;
    }
    throw new Error(`Failed to call function ${functionName}`);
  }
}
__name(callFunction, "callFunction");

// src/auth/api-client.js
var ApiClient = class {
  static {
    __name(this, "ApiClient");
  }
  configManager;
  backendClient;
  constructor(backendClient) {
    this.configManager = new ConfigManager();
    this.backendClient = backendClient || new DefaultClient();
  }
  async getVerificationUri() {
    const isLocalMode = process.env.HUNCHY_LOCAL_MODE === "true" || process.env.HUNCHY_USE_EMULATORS === "true";
    const websiteUrl = process.env.HUNCHY_WEBSITE_URL || (isLocalMode ? "http://localhost:3000" : WEBSITE_URL);
    return `${websiteUrl}${AUTH_PAGE_PATH}`;
  }
  generateDeviceCode() {
    return `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }
  async initialize() {
    await this.backendClient.initialize();
  }
  async startDeviceAuth() {
    const deviceCode = this.generateDeviceCode();
    const expiresIn = 600;
    await callFunction("initCliAuth", { deviceCode, expiresIn });
    const verificationUri = await this.getVerificationUri();
    return {
      deviceCode,
      userCode: deviceCode.substring(0, 8),
      verificationUri,
      expiresIn,
      interval: POLL_INTERVAL
    };
  }
  async pollForToken(deviceCode, interval = POLL_INTERVAL, maxAttempts = MAX_POLL_ATTEMPTS) {
    let attempts = 0;
    while (attempts < maxAttempts) {
      try {
        const result = await callFunction("pollCliAuth", { deviceCode });
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
            config: result.config
          };
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1e3));
        attempts++;
      } catch (error) {
        if (error instanceof AuthError) {
          throw error;
        }
        if (attempts >= maxAttempts - 1) {
          throw new TimeoutError("Authentication timeout. Please try again.");
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1e3));
        attempts++;
      }
    }
    throw new TimeoutError("Authentication timeout. Please try again.");
  }
  async setTokens(tokenResponse) {
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
  async logout() {
    await this.configManager.clear();
  }
  async isAuthenticated() {
    return await this.configManager.isAuthenticated();
  }
  async getAuthToken() {
    return await this.configManager.getAuthToken();
  }
  getConfigManager() {
    return this.configManager;
  }
  getBackendClient() {
    return this.backendClient;
  }
  getDefaultClient() {
    if (this.backendClient instanceof DefaultClient) {
      return this.backendClient;
    }
    return null;
  }
};

// src/utils/terminal.js
function clearScreen() {
  process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
}
__name(clearScreen, "clearScreen");
function getTerminalWidth() {
  return process.stdout.columns || 80;
}
__name(getTerminalWidth, "getTerminalWidth");

// src/commands/auth-command.js
var sleep = /* @__PURE__ */ __name((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "sleep");
async function performAuth(silent = false) {
  const apiClient = new ApiClient();
  await apiClient.initialize();
  if (!silent) {
    console.log(chalk.cyan("\n\u{1F510} Starting browser authentication...\n"));
  }
  const deviceAuth = await apiClient.startDeviceAuth();
  const authUrl = `${deviceAuth.verificationUri}?device_code=${deviceAuth.deviceCode}`;
  if (!silent) {
    console.log(chalk.white("1. Opening browser for authentication..."));
  }
  try {
    await open(authUrl);
    if (!silent) {
      console.log(chalk.green("   \u2713 Browser opened\n"));
    }
  } catch (error) {
    if (!silent) {
      console.log(chalk.yellow("   \u26A0\uFE0F  Could not open browser automatically"));
      console.log(chalk.gray("   Please visit: ") + chalk.cyan(authUrl) + "\n");
    }
  }
  if (!silent) {
    console.log(chalk.white("2. Waiting for authentication..."));
    console.log(chalk.gray("   Complete the authentication in your browser\n"));
  }
  let spinner;
  if (!silent) {
    spinner = ora({
      text: "Waiting for authentication...",
      spinner: "dots"
    }).start();
  }
  try {
    const tokenResponse = await apiClient.pollForToken(deviceAuth.deviceCode, deviceAuth.interval);
    if (spinner) {
      spinner.stop();
    }
    if (!silent) {
      console.log(chalk.green("   \u2713 Authentication successful\n"));
    }
    if (tokenResponse.email) {
      await apiClient.getConfigManager().setUserEmail(tokenResponse.email);
    }
    await apiClient.setTokens(tokenResponse);
    const backendClient = apiClient.getBackendClient();
    await backendClient.authenticate(tokenResponse.idToken, tokenResponse.customToken);
    if (!silent) {
      console.log(chalk.green("\u2713 ") + chalk.white("You are now authenticated!"));
      console.log(chalk.gray("   Email: ") + chalk.cyan(tokenResponse.email || "N/A"));
      console.log(chalk.gray("   User ID: ") + chalk.cyan(tokenResponse.userId));
      console.log("");
    }
    return tokenResponse;
  } catch (error) {
    if (spinner) {
      spinner.stop();
    }
    if (!silent) {
      if (error instanceof TimeoutError) {
        console.log(chalk.red("   \u2717 Authentication timed out"));
        console.log(chalk.gray("   Error: " + error.message));
      } else if (error instanceof AuthError) {
        console.log(chalk.red("   \u2717 Authentication failed"));
        console.log(chalk.gray("   Error: " + error.message));
      } else {
        console.log(chalk.red("   \u2717 Authentication failed or timed out"));
        console.log(chalk.gray("   Error: " + error.message));
      }
      console.log(chalk.gray("\n   Please try again: ") + chalk.cyan("hunchy auth"));
    }
    throw error;
  }
}
__name(performAuth, "performAuth");
function createAuthCommand() {
  const authCommand2 = new Command("auth");
  authCommand2.description("Authenticate with Hunchy via browser");
  authCommand2.option("-l, --local", "Use local Firebase emulators for development");
  authCommand2.action(async (options) => {
    if (options.local) {
      process.env.HUNCHY_USE_EMULATORS = "true";
      console.log(chalk.gray("\u{1F527} Using local Firebase emulators\n"));
    }
    try {
      await performAuth();
    } catch (error) {
      if (error instanceof ConfigError) {
        console.log(chalk.red("\n\u2717 Failed to start authentication"));
        console.log(chalk.gray("Error: " + error.message));
        console.log(chalk.gray("\nPlease ensure you have the correct backend configuration."));
        console.log(chalk.gray("If this is your first time, visit ") + chalk.cyan("https://hunchy-4a0dc.web.app") + chalk.gray(" to get started."));
      } else if (error instanceof BackendError) {
        console.log(chalk.red("\n\u2717 Failed to start authentication"));
        console.log(chalk.gray("Error: " + error.message));
        console.log(chalk.gray("\nPlease check your internet connection and try again."));
      } else if (!(error instanceof AuthError) && !(error instanceof TimeoutError)) {
        console.log(chalk.red("\n\u2717 Failed to start authentication"));
        const errorMessage = error.message;
        console.log(chalk.gray("Error: " + errorMessage));
        console.log(chalk.gray("\nPlease check your internet connection and try again."));
      }
      if (!process.env.HUNCHY_INTERACTIVE_MODE) {
        process.exit(1);
      }
    }
  });
  return authCommand2;
}
__name(createAuthCommand, "createAuthCommand");
var authCommand = {
  name: "auth",
  description: "Authenticate with Hunchy via browser",
  handler: async (_args, _options) => {
    const isInteractive = process.env.HUNCHY_INTERACTIVE_MODE === "true";
    if (isInteractive) {
      clearScreen();
      await sleep(100);
    }
    try {
      const tokenResponse = await performAuth(isInteractive);
      if (isInteractive) {
        await sleep(100);
        clearScreen();
      }
      return {
        success: true,
        message: "Authentication successful",
        email: tokenResponse.email,
        userId: tokenResponse.userId
      };
    } catch (error) {
      let errorMessage = "Failed to start authentication";
      let errorDetails = error.message;
      let hint = "";
      if (error instanceof ConfigError) {
        hint = "Please ensure you have the correct backend configuration. If this is your first time, visit https://hunchy-4a0dc.web.app to get started.";
      } else if (error instanceof BackendError) {
        hint = "Please check your internet connection and try again.";
      } else if (!(error instanceof AuthError) && !(error instanceof TimeoutError)) {
        hint = "Please check your internet connection and try again.";
      }
      return {
        success: false,
        message: errorMessage,
        error: errorDetails,
        hint
      };
    }
  }
};
function createLogoutCommand() {
  const logoutCommand2 = new Command("logout");
  logoutCommand2.description("Remove your credentials and logout");
  logoutCommand2.action(async () => {
    try {
      const apiClient = new ApiClient();
      await apiClient.logout();
      console.log(chalk.green("\u2713 ") + chalk.white("Logged out successfully"));
      process.exit(0);
    } catch (error) {
      console.log(chalk.red("\u2717 ") + chalk.white("Failed to logout"));
      console.log(chalk.gray("Error: " + error.message));
      process.exit(1);
    }
  });
  return logoutCommand2;
}
__name(createLogoutCommand, "createLogoutCommand");
function createStatusCommand() {
  const statusCommand = new Command("status");
  statusCommand.description("Check authentication status");
  statusCommand.action(async () => {
    try {
      const apiClient = new ApiClient();
      const isAuthenticated = await apiClient.isAuthenticated();
      if (isAuthenticated) {
        const configPath = apiClient.getConfigManager().getConfigPath();
        console.log(chalk.green("\u2713 ") + chalk.white("Authenticated"));
        console.log(chalk.gray("Config: " + configPath));
        const backendClient = apiClient.getBackendClient();
        try {
          const isBackendAvailable = await backendClient.isAvailable();
          if (isBackendAvailable) {
            console.log(chalk.green("\u2713 ") + chalk.white("Backend available"));
          } else {
            console.log(chalk.yellow("\u26A0\uFE0F  Backend configuration incomplete"));
            console.log(chalk.gray("Run: ") + chalk.cyan("hunchy auth") + chalk.gray(" to update configuration"));
          }
        } catch {
          console.log(chalk.yellow("\u26A0\uFE0F  Could not check backend availability"));
        }
        process.exit(0);
      } else {
        console.log(chalk.yellow("\u26A0\uFE0F  Not authenticated"));
        console.log(chalk.gray("Run: ") + chalk.cyan("hunchy auth"));
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red("\u2717 ") + chalk.white("Failed to check status"));
      console.log(chalk.gray("Error: " + error.message));
      process.exit(1);
    }
  });
  return statusCommand;
}
__name(createStatusCommand, "createStatusCommand");
var logoutCommand = {
  name: "logout",
  description: "Remove your credentials and logout",
  handler: async (_args, _options) => {
    try {
      const apiClient = new ApiClient();
      await apiClient.logout();
      return {
        success: true,
        message: "Logged out successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to logout",
        error: error.message
      };
    }
  }
};
var helpCommand = {
  name: "help",
  description: "Show available commands",
  handler: async (_args, _options) => {
    return {
      success: true,
      commands: [
        { name: "/auth", description: "Authenticate with Hunchy via browser" },
        { name: "/logout", description: "Remove your credentials and logout" },
        { name: "/help", description: "Show this help message" }
      ]
    };
  }
};

// src/commands/init-command-ink.js
import { Command as Command2 } from "commander";
import chalk3 from "chalk";

// src/terminal/ink-shell.js
import React15 from "react";
import { render } from "ink";

// src/components/app-with-shell.js
import React14 from "react";
import { Box as Box13 } from "ink";

// src/components/context/chat-context.js
import React, { createContext, useContext, useState, useCallback } from "react";
var ChatContext = createContext(null);
function ChatProvider({ children }) {
  const [state, setState] = useState({
    chatId: null,
    isProcessing: false,
    isInApproval: false,
    messages: [],
    sections: [],
    currentMessage: null
  });
  const setChatId = useCallback((chatId) => {
    setState((prev) => ({ ...prev, chatId }));
  }, []);
  const setProcessing = useCallback((isProcessing) => {
    setState((prev) => ({ ...prev, isProcessing }));
  }, []);
  const setApproval = useCallback((isInApproval) => {
    setState((prev) => ({ ...prev, isInApproval }));
  }, []);
  const addMessage = useCallback((message) => {
    setState((prev) => ({ ...prev, messages: [...prev.messages, message] }));
  }, []);
  const setSections = useCallback((sections) => {
    setState((prev) => ({ ...prev, sections }));
  }, []);
  const setCurrentMessage = useCallback((currentMessage) => {
    setState((prev) => ({ ...prev, currentMessage }));
  }, []);
  return /* @__PURE__ */ React.createElement(ChatContext.Provider, { value: {
    ...state,
    setChatId,
    setProcessing,
    setApproval,
    addMessage,
    setSections,
    setCurrentMessage
  } }, children);
}
__name(ChatProvider, "ChatProvider");
function useChatState() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatState must be used within ChatProvider");
  }
  return context;
}
__name(useChatState, "useChatState");

// src/components/ui/welcome-screen.js
import React2 from "react";
import { Box, Text } from "ink";
import gradient from "gradient-string";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
function WelcomeScreen({ userEmail }) {
  const __filename3 = fileURLToPath(import.meta.url);
  const __dirname3 = dirname(__filename3);
  const packageJsonPath2 = join(__dirname3, "..", "..", "..", "package.json");
  const packageJson2 = JSON.parse(readFileSync(packageJsonPath2, "utf-8"));
  const version2 = packageJson2.version || "0.0.1";
  const workspacePath = process.cwd();
  const homeDir = process.env.HOME || process.env.USERPROFILE || "";
  const displayPath = workspacePath.startsWith(homeDir) ? workspacePath.replace(homeDir, "~") : workspacePath;
  const blueGradient = gradient(["#0ea5e9", "#06b6d4"]);
  const logo = `\u2588 \u2588 \u2588 \u2588 \u2588\u2584 \u2588 \u2584\u2580\u2580 \u2588 \u2588 \u2588\u2584\u2588
\u2588\u2580\u2588 \u2588\u2584\u2588 \u2588 \u2580\u2588 \u2580\u2584\u2584 \u2588\u2580\u2588  \u2588`;
  const terminalWidth = getTerminalWidth();
  const boxWidth = Math.min(terminalWidth - 2, 120);
  const title = `Hunchy CLI v${version2}`;
  const titleSection = `\u2500\u2500\u2500 ${title} `;
  const remainingWidth = Math.max(1, boxWidth - titleSection.length - 1);
  const headerLineRaw = `\u256D${titleSection}${"\u2500".repeat(remainingWidth)}\u256E`;
  const headerLine = blueGradient(headerLineRaw);
  const leftColumnWidth = Math.floor((boxWidth - 3) / 2);
  const rightColumnWidth = boxWidth - leftColumnWidth - 3;
  const welcomeText = userEmail ? `Welcome back ${userEmail.split("@")[0]}!` : "Welcome!";
  const logoLines = logo.split("\n");
  const createHorizontalLine = /* @__PURE__ */ __name((leftChar, rightChar, fillChar = "\u2500") => {
    const fillWidth = Math.max(0, boxWidth - 2);
    return `${leftChar}${fillChar.repeat(fillWidth)}${rightChar}`;
  }, "createHorizontalLine");
  const bottomLineRaw = createHorizontalLine("\u2570", "\u256F");
  const bottomLine = blueGradient(bottomLineRaw);
  const truncateText = /* @__PURE__ */ __name((text, maxLength) => {
    if (text.length <= maxLength)
      return text;
    return text.substring(0, maxLength - 3) + "...";
  }, "truncateText");
  return /* @__PURE__ */ React2.createElement(Box, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React2.createElement(Text, null, headerLine), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1, paddingTop: 1 }, /* @__PURE__ */ React2.createElement(Text, null, welcomeText)), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1, paddingTop: 1 }, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("Tips for getting started"))), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, " ")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, " ")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, blueGradient(logoLines[0] || ""))), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, { dimColor: true }, "\u2022 Type /help for available commands")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, blueGradient(logoLines[1] || ""))), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, { dimColor: true }, "\u2022 Type a message to start chatting")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, " ")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, { dimColor: true }, "\u2022 Press Ctrl+C to exit")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1 }, userEmail && /* @__PURE__ */ React2.createElement(Text, { dimColor: true }, truncateText(userEmail, leftColumnWidth - 2))), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, " ")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, { dimColor: true }, truncateText(displayPath, leftColumnWidth - 2))), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("Recent activity"))), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Box, null, /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: leftColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, null, " ")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502")), /* @__PURE__ */ React2.createElement(Box, { width: rightColumnWidth, paddingX: 1 }, /* @__PURE__ */ React2.createElement(Text, { dimColor: true }, "No recent activity")), /* @__PURE__ */ React2.createElement(Text, null, blueGradient("\u2502"))), /* @__PURE__ */ React2.createElement(Text, null, bottomLine));
}
__name(WelcomeScreen, "WelcomeScreen");

// src/components/shell/enhanced-shell.js
import React13, { useState as useState12, useEffect as useEffect7, useMemo as useMemo3 } from "react";
import { Box as Box12, Text as Text11, useApp, useInput as useInput5 } from "ink";

// src/hooks/useChatIntegration.js
import { useState as useState2, useCallback as useCallback2 } from "react";

// src/services/auth-token-service.js
var AuthTokenService = class {
  static {
    __name(this, "AuthTokenService");
  }
  apiClient;
  constructor(apiClient) {
    this.apiClient = apiClient || new ApiClient();
  }
  async getAuthTokenOrThrow() {
    const idToken = await this.apiClient.getAuthToken();
    if (!idToken) {
      throw new AuthError("Authentication token not available");
    }
    return idToken;
  }
  getApiClient() {
    return this.apiClient;
  }
};

// src/services/chat/chat-initializer.js
var ChatInitializer = class {
  static {
    __name(this, "ChatInitializer");
  }
  chatInitialized = false;
  state = {
    userId: null,
    database: null,
    messagesPath: null
  };
  async initialize() {
    if (this.chatInitialized) {
      return this.state;
    }
    const apiClient = new ApiClient();
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }
    const backendClient = apiClient.getBackendClient();
    if (!(backendClient instanceof DefaultClient)) {
      throw new Error("Backend client not initialized");
    }
    await backendClient.initialize();
    const customToken = await apiClient.getConfigManager().getCustomToken();
    const authTokenService = new AuthTokenService(apiClient);
    try {
      const idToken = await authTokenService.getAuthTokenOrThrow();
      if (customToken && idToken) {
        await backendClient.authenticate(idToken, customToken);
      }
    } catch {
      throw new Error("Not authenticated");
    }
    const auth = backendClient.auth;
    if (auth?.currentUser) {
      this.state.userId = auth.currentUser.uid;
    } else {
      const config = await apiClient.getConfigManager().load();
      this.state.userId = config.userId || null;
    }
    if (!this.state.userId) {
      throw new Error("User ID not found");
    }
    this.state.database = backendClient.database;
    if (!this.state.database) {
      throw new Error("Database not initialized");
    }
    this.state.messagesPath = await apiClient.getConfigManager().getMessagesPath() || null;
    if (!this.state.messagesPath) {
      throw new Error("Configuration incomplete");
    }
    this.chatInitialized = true;
    return this.state;
  }
  getState() {
    return this.state;
  }
  isInitialized() {
    return this.chatInitialized;
  }
};

// src/utils/error-utils.js
function getErrorMessage(error, fallback = "Unknown error") {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return fallback;
}
__name(getErrorMessage, "getErrorMessage");

// src/utils/firebase-helpers.js
import { ref as ref3, update, set as set3, push } from "firebase/database";

// src/types/enums.js
var SectionStatus = {
  PENDING: "pending",
  RUNNING: "running",
  DONE: "done",
  ERROR: "error",
  EXECUTED: "executed"
};
var ToolRequestStatus = {
  PENDING: "pending",
  EXECUTING: "executing",
  COMPLETED: "completed",
  ERROR: "error"
};
var MessageStatus = {
  PENDING: "pending",
  COMPLETED: "completed",
  ERROR: "error"
};
var CommitStep = {
  STAGING: "staging",
  COMMITTING: "committing",
  VERIFYING: "verifying",
  DONE: "done"
};
var SectionType = {
  AGENT: "agent",
  TOOL_USE: "tool_use",
  THINKING: "thinking",
  COMMIT_DETAILS: "commit_details",
  COMMIT_PROPOSAL: "commit_proposal"
};

// src/utils/firebase-helpers.js
function getMessageRef(database, messagesPath, messageId) {
  return ref3(database, `${messagesPath}/${messageId}`);
}
__name(getMessageRef, "getMessageRef");
function getToolRequestRef(database, messagesPath, messageId, toolRequestId) {
  return ref3(database, `${messagesPath}/${messageId}/toolRequests/${toolRequestId}`);
}
__name(getToolRequestRef, "getToolRequestRef");
function getMessagesRef(database, messagesPath) {
  return ref3(database, messagesPath);
}
__name(getMessagesRef, "getMessagesRef");
function getToolRequestsRef(database, messagesPath, messageId) {
  return ref3(database, `${messagesPath}/${messageId}/toolRequests`);
}
__name(getToolRequestsRef, "getToolRequestsRef");
async function createUserMessage(database, messagesPath, userId, content, chatId) {
  const messagesRef = getMessagesRef(database, messagesPath);
  const messageRef = push(messagesRef);
  const messageId = messageRef.key;
  const userMessage = {
    userId,
    role: "user",
    content,
    createdAt: Date.now(),
    status: MessageStatus.PENDING,
    chatId
  };
  await set3(messageRef, userMessage);
  return messageId;
}
__name(createUserMessage, "createUserMessage");
async function updateMessageSections(database, messagesPath, messageId, sections) {
  try {
    const messageRef = getMessageRef(database, messagesPath, messageId);
    await update(messageRef, {
      sections,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.warn("Failed to update message sections:", err);
    throw err;
  }
}
__name(updateMessageSections, "updateMessageSections");
async function updateToolRequestStatus(database, messagesPath, messageId, toolRequestId, status, result) {
  try {
    const requestRef = getToolRequestRef(database, messagesPath, messageId, toolRequestId);
    const updateData = {
      status
    };
    if (result) {
      if (result.success && result.result !== void 0) {
        updateData.result = result.result;
      }
      if (!result.success && result.error) {
        updateData.error = result.error;
      }
    }
    await set3(requestRef, updateData);
  } catch (err) {
    console.warn("Failed to update tool request status:", err);
    throw err;
  }
}
__name(updateToolRequestStatus, "updateToolRequestStatus");

// src/services/chat/chat-message-handler.js
var ChatMessageHandler = class {
  static {
    __name(this, "ChatMessageHandler");
  }
  chatInitializer;
  state = null;
  constructor(chatInitializer) {
    this.chatInitializer = chatInitializer;
  }
  async handleMessage(message, chatId, onMessageSent) {
    try {
      const apiClient = new ApiClient();
      const isAuthenticated = await apiClient.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error("Not authenticated. Please authenticate first with /auth or hunchy auth");
      }
      if (!this.chatInitializer.isInitialized()) {
        try {
          this.state = await this.chatInitializer.initialize();
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          throw new Error(`Chat not available: ${errorMessage}. Please authenticate first with /auth or hunchy auth`);
        }
      } else {
        this.state = this.chatInitializer.getState();
      }
      if (!this.state.database || !this.state.userId || !this.state.messagesPath) {
        const details = [
          `Database: ${this.state.database ? "\u2713" : "\u2717"}`,
          `UserId: ${this.state.userId ? "\u2713" : "\u2717"}`,
          `MessagesPath: ${this.state.messagesPath ? "\u2713" : "\u2717"}`
        ].join(", ");
        throw new Error(`Chat not available (${details}). Please authenticate first with /auth or hunchy auth`);
      }
      let finalChatId = chatId;
      let messageId;
      if (!chatId) {
        const authTokenService = new AuthTokenService(apiClient);
        const idToken = await authTokenService.getAuthTokenOrThrow();
        const result = await callFunction("createChatWithMessage", { content: message }, idToken);
        finalChatId = result.chatId;
        messageId = result.messageId;
      } else {
        messageId = await createUserMessage(this.state.database, this.state.messagesPath, this.state.userId, message, chatId);
      }
      onMessageSent(messageId, finalChatId);
    } catch (error) {
      throw error;
    }
  }
  getState() {
    return this.state || this.chatInitializer.getState();
  }
};

// src/hooks/useChatIntegration.js
function useChatIntegration() {
  const [chatId, setChatId] = useState2(null);
  const [chatInitializer] = useState2(() => new ChatInitializer());
  const [chatMessageHandler] = useState2(() => new ChatMessageHandler(chatInitializer));
  const sendMessage = useCallback2(async (message) => {
    return new Promise((resolve, reject) => {
      chatMessageHandler.handleMessage(message, chatId, (messageId, newChatId) => {
        if (newChatId) {
          setChatId(newChatId);
          resolve({ messageId, chatId: newChatId });
        } else {
          resolve({ messageId, chatId: chatId || "" });
        }
      }).catch(reject);
    });
  }, [chatId, chatMessageHandler]);
  const getState = useCallback2(() => {
    return chatMessageHandler.getState();
  }, [chatMessageHandler]);
  return {
    chatId,
    sendMessage,
    getState
  };
}
__name(useChatIntegration, "useChatIntegration");

// src/hooks/useFirebaseMessages.js
import { useEffect, useState as useState3, useRef } from "react";
import { onValue as onValue2, onChildAdded, onChildChanged } from "firebase/database";
function useFirebaseMessages(database, chatId, userId, messagesPath) {
  const [messages, setMessages] = useState3([]);
  const [isProcessing, setIsProcessing] = useState3(false);
  const messagesMapRef = useRef(/* @__PURE__ */ new Map());
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!database || !chatId || !messagesPath || !userId) {
      return;
    }
    const messagesRef = getMessagesRef(database, messagesPath);
    messagesMapRef.current.clear();
    initializedRef.current = false;
    const updateMessages = /* @__PURE__ */ __name(() => {
      const messageList = Array.from(messagesMapRef.current.values()).filter((msg) => msg.chatId === chatId && msg.userId === userId).sort((a, b) => a.createdAt - b.createdAt);
      setMessages(messageList);
      setIsProcessing(messageList.some((m) => m.status === MessageStatus.PENDING));
    }, "updateMessages");
    const handleIncrementalMessage = /* @__PURE__ */ __name((snapshot) => {
      if (!initializedRef.current)
        return;
      const id = snapshot.key;
      if (!id)
        return;
      const msg = snapshot.val();
      if (msg.chatId === chatId && msg.userId === userId) {
        messagesMapRef.current.set(id, { ...msg, id });
        updateMessages();
      }
    }, "handleIncrementalMessage");
    const unsubscribeInitial = onValue2(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        initializedRef.current = true;
        updateMessages();
        return;
      }
      const data = snapshot.val();
      messagesMapRef.current.clear();
      Object.entries(data).forEach(([id, msg]) => {
        if (msg.chatId === chatId && msg.userId === userId) {
          messagesMapRef.current.set(id, { ...msg, id });
        }
      });
      initializedRef.current = true;
      updateMessages();
    });
    const unsubscribeAdded = onChildAdded(messagesRef, handleIncrementalMessage);
    const unsubscribeChanged = onChildChanged(messagesRef, handleIncrementalMessage);
    return () => {
      unsubscribeInitial();
      unsubscribeAdded();
      unsubscribeChanged();
      messagesMapRef.current.clear();
      initializedRef.current = false;
    };
  }, [chatId, database, messagesPath, userId]);
  return { messages, isProcessing };
}
__name(useFirebaseMessages, "useFirebaseMessages");

// src/hooks/useToolRequests.js
import { useEffect as useEffect2, useRef as useRef2 } from "react";
import { onValue as onValue3, onChildAdded as onChildAdded2, set as set4 } from "firebase/database";

// src/services/git-service.js
import { simpleGit } from "simple-git";
var GitService = class {
  static {
    __name(this, "GitService");
  }
  git;
  constructor(repoPath) {
    this.git = simpleGit(repoPath || process.cwd());
  }
  async getStatus() {
    const status = await this.git.status();
    const staged = status.staged;
    const modified = status.modified;
    const untracked = status.not_added;
    return {
      staged,
      modified,
      untracked,
      summary: {
        totalFiles: staged.length + modified.length + untracked.length,
        staged: staged.length,
        modified: modified.length,
        untracked: untracked.length
      }
    };
  }
  async getDiff(staged = false) {
    if (staged) {
      return await this.git.diff(["--cached"]);
    }
    return await this.git.diff();
  }
  async getDiffForFile(filePath) {
    return await this.git.diff(["--", filePath]);
  }
  async getLog(count = 10) {
    const log = await this.git.log({ maxCount: count });
    return log.all.map((commit) => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date
    }));
  }
  async showFile(filePath, revision = "HEAD") {
    return await this.git.show([`${revision}:${filePath}`]);
  }
  async getCurrentBranch() {
    const status = await this.git.status();
    return status.current || "unknown";
  }
  async isGitRepo() {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }
  async addFiles(files) {
    if (files.length === 0)
      return;
    await this.git.add(files);
  }
  async commit(message) {
    const result = await this.git.commit(message);
    if (result.commit) {
      return result.commit;
    }
    const log = await this.git.log({ maxCount: 1 });
    return log.latest?.hash || "";
  }
  async getLastCommitHash() {
    const log = await this.git.log({ maxCount: 1 });
    return log.latest?.hash.substring(0, 7) || "";
  }
};

// src/utils/tool-wrapper.js
function wrapToolExecution(fn) {
  return fn().then((result) => ({
    success: true,
    result
  })).catch((error) => ({
    success: false,
    error: getErrorMessage(error)
  }));
}
__name(wrapToolExecution, "wrapToolExecution");

// src/services/tools/git-tools.js
function createGitTools(gitService) {
  const tools = /* @__PURE__ */ new Map();
  tools.set("git_status", async () => {
    return wrapToolExecution(async () => {
      const isRepo = await gitService.isGitRepo();
      if (!isRepo) {
        throw new Error("Not a git repository");
      }
      return await gitService.getStatus();
    });
  });
  tools.set("git_diff", async (input) => {
    return wrapToolExecution(async () => {
      const staged = input.staged;
      return await gitService.getDiff(staged || false);
    });
  });
  tools.set("git_diff_file", async (input) => {
    return wrapToolExecution(async () => {
      const filePath = input.file_path;
      if (!filePath) {
        throw new Error("file_path is required");
      }
      return await gitService.getDiffForFile(filePath);
    });
  });
  tools.set("git_log", async (input) => {
    return wrapToolExecution(async () => {
      const count = input.count;
      return await gitService.getLog(count || 10);
    });
  });
  tools.set("git_show_file", async (input) => {
    return wrapToolExecution(async () => {
      const filePath = input.file_path;
      if (!filePath) {
        throw new Error("file_path is required");
      }
      const revision = input.revision;
      return await gitService.showFile(filePath, revision || "HEAD");
    });
  });
  return tools;
}
__name(createGitTools, "createGitTools");

// src/services/tools/filesystem-tools.js
import { readFileSync as readFileSync2, readdirSync, statSync } from "node:fs";
import { join as join2 } from "node:path";
function createFilesystemTools() {
  const tools = /* @__PURE__ */ new Map();
  tools.set("list_files", async (input) => {
    return wrapToolExecution(async () => {
      const path3 = input.path || process.cwd();
      const entries = readdirSync(path3);
      const files = [];
      for (const entry of entries) {
        const fullPath = join2(path3, entry);
        const stats = statSync(fullPath);
        files.push({
          name: entry,
          type: stats.isDirectory() ? "directory" : "file"
        });
      }
      return files;
    });
  });
  tools.set("read_file", async (input) => {
    return wrapToolExecution(async () => {
      const filePath = input.file_path;
      if (!filePath) {
        throw new Error("file_path is required");
      }
      return readFileSync2(filePath, "utf-8");
    });
  });
  return tools;
}
__name(createFilesystemTools, "createFilesystemTools");

// src/services/tool-registry.js
var ToolRegistry = class {
  static {
    __name(this, "ToolRegistry");
  }
  tools = /* @__PURE__ */ new Map();
  gitService;
  constructor(repoPath) {
    this.gitService = new GitService(repoPath);
    this.registerDefaultTools();
  }
  registerDefaultTools() {
    const gitTools = createGitTools(this.gitService);
    const filesystemTools = createFilesystemTools();
    for (const [name, handler] of gitTools) {
      this.tools.set(name, handler);
    }
    for (const [name, handler] of filesystemTools) {
      this.tools.set(name, handler);
    }
  }
  register(name, handler) {
    this.tools.set(name, handler);
  }
  async execute(name, input) {
    const handler = this.tools.get(name);
    if (!handler) {
      return {
        success: false,
        error: `Tool not found: ${name}`
      };
    }
    try {
      return await handler(input || {});
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  has(name) {
    return this.tools.has(name);
  }
  getRegisteredTools() {
    return Array.from(this.tools.keys());
  }
};

// src/services/tool-executor.js
var ToolExecutor = class {
  static {
    __name(this, "ToolExecutor");
  }
  registry;
  constructor(repoPath) {
    this.registry = new ToolRegistry(repoPath);
  }
  async executeTool(toolName, input) {
    return await this.registry.execute(toolName, input || {});
  }
};

// src/hooks/useToolRequests.js
function useToolRequests(database, chatId, userId, messagesPath) {
  const executedRequestsRef = useRef2(/* @__PURE__ */ new Set());
  const toolExecutorRef = useRef2(null);
  const subscriptionsRef = useRef2(/* @__PURE__ */ new Map());
  useEffect2(() => {
    if (!database || !chatId || !messagesPath || !userId) {
      return;
    }
    if (!toolExecutorRef.current) {
      toolExecutorRef.current = new ToolExecutor();
    }
    const messagesRef = getMessagesRef(database, messagesPath);
    const unsubscribeMessages = onValue3(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const messages = snapshot.val();
      Object.entries(messages).forEach(([messageId, msg]) => {
        if (msg.chatId !== chatId || msg.userId !== userId) {
          return;
        }
        const toolRequestsRef = getToolRequestsRef(database, messagesPath, messageId);
        if (subscriptionsRef.current.has(messageId)) {
          return;
        }
        const unsubscribe = onChildAdded2(toolRequestsRef, async (toolSnapshot) => {
          const toolRequestId = toolSnapshot.key;
          if (!toolRequestId)
            return;
          const uniqueKey = `${messageId}/${toolRequestId}`;
          if (executedRequestsRef.current.has(uniqueKey)) {
            return;
          }
          const toolRequest = toolSnapshot.val();
          if (toolRequest.status !== ToolRequestStatus.PENDING) {
            return;
          }
          const requestRef = getToolRequestRef(database, messagesPath, messageId, toolRequestId);
          await set4(requestRef, {
            ...toolRequest,
            status: ToolRequestStatus.EXECUTING
          });
          executedRequestsRef.current.add(uniqueKey);
          try {
            const executor = toolExecutorRef.current;
            const result = await executor.executeTool(toolRequest.tool, toolRequest.input || {});
            await updateToolRequestStatus(database, messagesPath, messageId, toolRequestId, result.success ? ToolRequestStatus.COMPLETED : ToolRequestStatus.ERROR, result);
          } catch (error) {
            await set4(requestRef, {
              ...toolRequest,
              status: ToolRequestStatus.ERROR,
              error: getErrorMessage(error)
            });
          }
        });
        subscriptionsRef.current.set(messageId, unsubscribe);
      });
    });
    return () => {
      unsubscribeMessages();
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, [database, chatId, userId, messagesPath]);
}
__name(useToolRequests, "useToolRequests");

// src/hooks/useCommands.js
import { useMemo } from "react";

// src/commands/usage-command.js
var usageCommand = {
  name: "usage",
  description: "Show your usage statistics and plan information",
  handler: async (_args, _options) => {
    const apiClient = new ApiClient();
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error("Not authenticated. Please run /auth first.");
    }
    const authTokenService = new AuthTokenService(apiClient);
    const idToken = await authTokenService.getAuthTokenOrThrow();
    const usageData = await callFunction("getUsageData", {}, idToken);
    return usageData;
  }
};

// src/hooks/useCommands.js
function useCommands() {
  const commands = useMemo(() => {
    return [authCommand, logoutCommand, helpCommand, usageCommand];
  }, []);
  const getCommand = /* @__PURE__ */ __name((name) => {
    return commands.find((cmd) => cmd.name === name || cmd.aliases?.includes(name));
  }, "getCommand");
  const getSuggestions = /* @__PURE__ */ __name((input) => {
    if (!input.startsWith("/")) {
      return [];
    }
    const query = input.slice(1).toLowerCase();
    if (!query) {
      return commands;
    }
    return commands.filter((cmd) => {
      const nameMatch = cmd.name.toLowerCase().startsWith(query);
      const aliasMatch = cmd.aliases?.some((alias) => alias.toLowerCase().startsWith(query));
      return nameMatch || aliasMatch;
    });
  }, "getSuggestions");
  return {
    commands,
    getCommand,
    getSuggestions
  };
}
__name(useCommands, "useCommands");

// src/hooks/use-commit-execution.js
import { useState as useState4, useCallback as useCallback3 } from "react";

// src/services/commit-executor.js
var CommitExecutor = class {
  static {
    __name(this, "CommitExecutor");
  }
  gitService;
  constructor(repoPath) {
    this.gitService = new GitService(repoPath);
  }
  async notifyCommitRecorded(userId) {
    try {
      const apiClient = new ApiClient();
      const idToken = await apiClient.getAuthToken();
      if (!idToken) {
        console.warn("No auth token available, skipping commit tracking");
        return;
      }
      await callFunction("recordCommit", {}, idToken);
    } catch (error) {
      console.warn("Failed to record commit in backend:", error);
    }
  }
  async executeCommit(commit) {
    try {
      if (commit.files.length === 0) {
        return {
          success: false,
          commit,
          error: "No files specified for commit"
        };
      }
      await this.gitService.addFiles(commit.files);
      const hash = await this.gitService.commit(commit.message);
      return {
        success: true,
        commit: {
          ...commit,
          hash
        },
        hash
      };
    } catch (error) {
      return {
        success: false,
        commit,
        error: getErrorMessage(error)
      };
    }
  }
  async executeCommits(commits) {
    const results = [];
    for (const commit of commits) {
      const result = await this.executeCommit(commit);
      results.push(result);
      if (!result.success) {
        break;
      }
    }
    return results;
  }
  async verifyCommits(commits) {
    try {
      const log = await this.gitService.getLog(commits.length);
      const commitHashes = log.map((c) => c.hash);
      return commits.every((commit) => {
        if (!commit.hash)
          return false;
        if (commitHashes.includes(commit.hash)) {
          return true;
        }
        const commitHashShort = commit.hash.substring(0, 7);
        const logHashesShort = commitHashes.map((h) => h.substring(0, 7));
        return logHashesShort.includes(commitHashShort);
      });
    } catch {
      return false;
    }
  }
};

// src/utils/id-generator.js
function generateId(prefix) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}-${timestamp}-${random}`;
}
__name(generateId, "generateId");
function generateCommitId(index) {
  return generateId(`commit-${index}`);
}
__name(generateCommitId, "generateCommitId");

// src/hooks/use-commit-execution.js
function useCommitExecution({ database, messagesPath, userId, setSections, setProcessing, setError, setShowCommitSuccess, setCurrentMessage }) {
  const [executedCommitMessageIds, setExecutedCommitMessageIds] = useState4(/* @__PURE__ */ new Set());
  const executeCommits = useCallback3(async (commits, latestMessage, preservedSections) => {
    const messageId = latestMessage?.id;
    if (messageId) {
      setExecutedCommitMessageIds((prev) => new Set(prev).add(messageId));
    }
    const updatedPreservedSections = preservedSections.map((section) => {
      if (section.type === "commit_proposal") {
        return {
          ...section,
          metadata: {
            ...section.metadata,
            approved: true,
            status: SectionStatus.EXECUTED
          }
        };
      }
      return section;
    });
    setSections(updatedPreservedSections);
    if (messageId && database && messagesPath) {
      try {
        await updateMessageSections(database, messagesPath, messageId, updatedPreservedSections);
      } catch (err) {
        console.warn("Failed to update message sections:", err);
      }
    }
    try {
      const executor = new CommitExecutor();
      const commitResults = [];
      const commitSections = [];
      for (let i = 0; i < commits.length; i++) {
        const commit = commits[i];
        const commitSection = {
          id: generateCommitId(i),
          type: "commit_details",
          title: `${i + 1}. ${commit.message}`,
          summary: `Creating commit ${i + 1}/${commits.length}...`,
          details: {
            step: CommitStep.STAGING,
            files: commit.files,
            commands: [`git add ${commit.files.join(" ")}`],
            message: commit.message
          },
          metadata: {
            status: SectionStatus.RUNNING
          }
        };
        commitSections.push(commitSection);
        const currentSections = [...updatedPreservedSections, ...commitSections];
        setSections(currentSections);
        if (messageId && database && messagesPath) {
          try {
            await updateMessageSections(database, messagesPath, messageId, currentSections);
          } catch (err) {
            console.warn("Failed to update message sections:", err);
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 200));
        commitSection.details = {
          step: CommitStep.COMMITTING,
          files: commit.files,
          commands: [
            `git add ${commit.files.join(" ")}`,
            `git commit -m "${commit.message}"`
          ],
          message: commit.message
        };
        commitSection.summary = `Creating commit ${i + 1}/${commits.length}...`;
        setSections([...updatedPreservedSections, ...commitSections]);
        if (messageId && database && messagesPath) {
          try {
            await updateMessageSections(database, messagesPath, messageId, [...updatedPreservedSections, ...commitSections]);
          } catch (err) {
            console.warn("Failed to update message sections:", err);
          }
        }
        const result = await executor.executeCommit(commit);
        if (!result.success) {
          commitSection.metadata = { status: SectionStatus.ERROR };
          commitSection.summary = `\u2717 Failed to create commit ${i + 1}`;
          setSections([...updatedPreservedSections, ...commitSections]);
          setError(`Failed to create commit ${i + 1}: ${result.error}`);
          setProcessing(false);
          return;
        }
        commits[i] = result.commit;
        if (result.hash) {
          commitResults.push({ commit: result.commit, hash: result.hash });
          commitSection.details = {
            step: CommitStep.DONE,
            files: commit.files,
            commands: [
              `git add ${commit.files.join(" ")}`,
              `git commit -m "${commit.message}"`
            ],
            hash: result.hash,
            message: commit.message
          };
          commitSection.metadata = { status: SectionStatus.DONE };
          commitSection.title = `${i + 1}. ${commit.message}`;
          commitSection.summary = `\u2713 Commit ${i + 1}/${commits.length} created`;
        }
        setSections([...updatedPreservedSections, ...commitSections]);
        if (messageId && database && messagesPath) {
          try {
            await updateMessageSections(database, messagesPath, messageId, [...updatedPreservedSections, ...commitSections]);
          } catch (err) {
            console.warn("Failed to update message sections:", err);
          }
        }
        if (userId) {
          executor.notifyCommitRecorded(userId).catch((err) => {
            console.warn("Failed to track commit:", err);
          });
        }
        if (i < commits.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }
      const finalSections = [...updatedPreservedSections, ...commitSections];
      setSections(finalSections);
      if (messageId && database && messagesPath) {
        try {
          await updateMessageSections(database, messagesPath, messageId, finalSections);
        } catch (err) {
          console.warn("Failed to update message sections:", err);
        }
      }
      const verified = await executor.verifyCommits(commits);
      if (!verified) {
        setError("Warning: Some commits may not have been created correctly");
        setProcessing(false);
        return;
      }
      setProcessing(false);
      await new Promise((resolve) => setTimeout(resolve, 100));
      setShowCommitSuccess(true);
      setTimeout(() => {
        setShowCommitSuccess(false);
      }, 12e3);
      if (latestMessage) {
        setCurrentMessage(latestMessage);
      }
    } catch (error) {
      setError(getErrorMessage(error, "Failed to execute commits"));
      setProcessing(false);
      setShowCommitSuccess(false);
    }
  }, [database, messagesPath, userId, setSections, setProcessing, setError, setShowCommitSuccess, setCurrentMessage]);
  return {
    executedCommitMessageIds,
    executeCommits
  };
}
__name(useCommitExecution, "useCommitExecution");

// src/hooks/use-message-filtering.js
import { useMemo as useMemo2 } from "react";
function useMessageFiltering({ messages }) {
  const filteredMessages = useMemo2(() => {
    const seenIds = /* @__PURE__ */ new Set();
    const result = [];
    for (const message of messages) {
      const messageId = message.id || `${message.createdAt}-${message.role}`;
      if (!seenIds.has(messageId)) {
        seenIds.add(messageId);
        const messageSections = message.sections || [];
        result.push({
          message,
          sections: messageSections
        });
      }
    }
    return result;
  }, [messages]);
  return filteredMessages;
}
__name(useMessageFiltering, "useMessageFiltering");

// src/components/shell/message-stream.js
import React8 from "react";
import { Box as Box7, Text as Text6 } from "ink";

// src/components/tree/tree-view.js
import React7, { useState as useState7 } from "react";
import { Box as Box6, useInput } from "ink";

// src/components/tree/tool-section.js
import React3, { useState as useState5, useEffect as useEffect3 } from "react";
import { Box as Box2, Text as Text2 } from "ink";

// src/utils/tree/tree-formatter.js
import chalk2 from "chalk";
function formatToolTitle(tool) {
  let toolTitle = tool.title;
  const toolDetails = tool.details;
  if (toolDetails && "input" in toolDetails && toolDetails.input) {
    const input = toolDetails.input;
    if (tool.title === "git_diff_file" && input.file_path) {
      toolTitle = `git_diff_file(${input.file_path})`;
    } else if (tool.title === "git_show_file" && input.file_path) {
      const revision = input.revision ? `@${input.revision}` : "";
      toolTitle = `git_show_file(${input.file_path}${revision})`;
    } else if (tool.title === "git_log" && input.count) {
      toolTitle = `git_log(count: ${input.count})`;
    } else if ((tool.title === "Read" || tool.title === "read_file") && (input.file_path || input.target_file)) {
      const filePath = input.file_path || input.target_file;
      toolTitle = `Read(${filePath})`;
    }
  }
  return toolTitle;
}
__name(formatToolTitle, "formatToolTitle");

// src/components/tree/tool-section.js
function BlinkingDot() {
  const [dimmed, setDimmed] = useState5(false);
  useEffect3(() => {
    const interval = setInterval(() => {
      setDimmed((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ React3.createElement(Text2, { color: "gray", dimColor: dimmed }, "\u23FA ");
}
__name(BlinkingDot, "BlinkingDot");
function ToolSection({ section, isExpanded, isLast }) {
  const toolTitle = formatToolTitle(section);
  const isRunning = section.metadata?.status === SectionStatus.RUNNING;
  const isDone = section.metadata?.status === SectionStatus.DONE;
  const isError = section.metadata?.status === SectionStatus.ERROR;
  const dotColor = isRunning ? "gray" : isDone ? "cyan" : isError ? "red" : "cyan";
  const statusIcon = isDone ? "\u2713" : isError ? "\u2717" : "";
  const toolDetails = section.details;
  const hasDetails = toolDetails && "result" in toolDetails && toolDetails.result !== void 0;
  return /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "column", marginLeft: 1 }, /* @__PURE__ */ React3.createElement(Box2, null, isRunning ? /* @__PURE__ */ React3.createElement(BlinkingDot, null) : /* @__PURE__ */ React3.createElement(Text2, { color: dotColor }, "\u23FA "), /* @__PURE__ */ React3.createElement(Text2, { color: dotColor }, toolTitle), statusIcon && /* @__PURE__ */ React3.createElement(React3.Fragment, null, /* @__PURE__ */ React3.createElement(Text2, { dimColor: true }, " \xB7 "), /* @__PURE__ */ React3.createElement(Text2, null, statusIcon))), hasDetails && toolDetails && /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "column", marginLeft: 3 }, renderToolDetails(toolDetails, isExpanded)));
}
__name(ToolSection, "ToolSection");
function renderToolDetails(details, isExpanded) {
  if (details && "result" in details && details.result !== void 0) {
    const result = details.result;
    let lineCount = null;
    if (typeof result === "string") {
      lineCount = result.split("\n").filter((l) => l.trim().length > 0).length;
    }
    const resultString = typeof result === "string" ? result : JSON.stringify(result, null, 2);
    const allLines = resultString.split("\n");
    const firstLine = allLines[0] || "";
    const remainingLines = allLines.slice(1);
    const hasMore = remainingLines.length > 0;
    const isGitDiff = resultString.includes("diff --git");
    const renderLine = /* @__PURE__ */ __name((line, index) => {
      if (isGitDiff) {
        const isDiffGitLine = line.trim().startsWith("diff --git");
        return /* @__PURE__ */ React3.createElement(Box2, { key: index }, /* @__PURE__ */ React3.createElement(Text2, { dimColor: !isDiffGitLine }, "     ", line));
      } else {
        return /* @__PURE__ */ React3.createElement(Box2, { key: index }, /* @__PURE__ */ React3.createElement(Text2, null, "     ", line));
      }
    }, "renderLine");
    if (isExpanded) {
      const linesToShow = allLines.slice(0, 20);
      return /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "column" }, lineCount !== null && lineCount > 0 && /* @__PURE__ */ React3.createElement(Box2, null, /* @__PURE__ */ React3.createElement(Text2, null, "\u23BF  Read ", lineCount, " line", lineCount !== 1 ? "s" : "")), linesToShow.map((line, i) => renderLine(line, i)), allLines.length > 20 && /* @__PURE__ */ React3.createElement(Box2, null, /* @__PURE__ */ React3.createElement(Text2, { dimColor: true }, "     ... (", allLines.length - 20, " more lines)")));
    } else {
      return /* @__PURE__ */ React3.createElement(Box2, { flexDirection: "column" }, lineCount !== null && lineCount > 0 && /* @__PURE__ */ React3.createElement(Box2, null, /* @__PURE__ */ React3.createElement(Text2, null, "\u23BF  Read ", lineCount, " line", lineCount !== 1 ? "s" : "")), firstLine && renderLine(firstLine, 0), hasMore && /* @__PURE__ */ React3.createElement(Box2, null, /* @__PURE__ */ React3.createElement(Text2, { dimColor: true }, "     ... (", remainingLines.length, " more lines)")));
    }
  }
  return null;
}
__name(renderToolDetails, "renderToolDetails");

// src/components/tree/thinking-section.js
import React4 from "react";
import { Box as Box3, Text as Text3 } from "ink";
function ThinkingSection({ section, isExpanded, isLast }) {
  const prefix = isLast ? "\u2514\u2500" : "\u251C\u2500";
  return /* @__PURE__ */ React4.createElement(Box3, { flexDirection: "column", marginLeft: 3 }, /* @__PURE__ */ React4.createElement(Box3, null, /* @__PURE__ */ React4.createElement(Text3, { dimColor: true }, prefix, " "), /* @__PURE__ */ React4.createElement(Text3, { color: "yellow" }, "\u{1F4AD} "), /* @__PURE__ */ React4.createElement(Text3, null, section.summary)), isExpanded && section.details && /* @__PURE__ */ React4.createElement(Box3, { flexDirection: "column", marginLeft: 2 }, String(section.details).split("\n").map((line, i) => /* @__PURE__ */ React4.createElement(Text3, { key: i, dimColor: true }, "  ", line))));
}
__name(ThinkingSection, "ThinkingSection");

// src/components/tree/commit-section.js
import React5, { useState as useState6, useEffect as useEffect4 } from "react";
import { Box as Box4, Text as Text4 } from "ink";
function BlinkingDot2() {
  const [dimmed, setDimmed] = useState6(false);
  useEffect4(() => {
    const interval = setInterval(() => {
      setDimmed((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return /* @__PURE__ */ React5.createElement(Text4, { color: "gray", dimColor: dimmed }, "\u23FA ");
}
__name(BlinkingDot2, "BlinkingDot");
function CommitSection({ section, isExpanded, isLast }) {
  const isRunning = section.metadata?.status === SectionStatus.RUNNING;
  const isDone = section.metadata?.status === SectionStatus.DONE;
  const isError = section.metadata?.status === SectionStatus.ERROR;
  const details = section.details;
  const hash = details?.hash || "";
  const shortHash = hash ? hash.substring(0, 7) : "";
  const message = details?.message || section.title.replace(/^\d+\.\s*/, "");
  const truncatedMessage = message.length > 50 ? message.substring(0, 47) + "\u2026" : message;
  const dotColor = isRunning ? "gray" : isDone ? "cyan" : isError ? "red" : "cyan";
  const statusIcon = isDone ? "\u2713" : isError ? "\u2717" : "";
  const numberMatch = section.title.match(/^(\d+)\./);
  const number = numberMatch ? numberMatch[1] : "";
  const hashDisplay = shortHash || "...";
  const displayText = `${number}. (-o- ${hashDisplay}) ${truncatedMessage}`;
  const commandsTree = details?.commands && details.commands.length > 0 ? details.commands.map((cmd, index) => {
    let commandText = cmd;
    if (cmd.startsWith("git add")) {
      const files = details.files?.join(" ") || "";
      commandText = `git add ${files}`;
    }
    const commands = details.commands;
    const isLast2 = index === commands.length - 1;
    const treeChar = isLast2 ? "\u2514\u2500" : "\u251C\u2500";
    return { treeChar, commandText };
  }) : null;
  return /* @__PURE__ */ React5.createElement(Box4, { flexDirection: "column", marginLeft: 1 }, /* @__PURE__ */ React5.createElement(Box4, { flexDirection: "column" }, /* @__PURE__ */ React5.createElement(Box4, null, isRunning ? /* @__PURE__ */ React5.createElement(BlinkingDot2, null) : /* @__PURE__ */ React5.createElement(Text4, { color: dotColor }, "\u23FA "), /* @__PURE__ */ React5.createElement(Text4, { color: dotColor }, displayText), statusIcon && /* @__PURE__ */ React5.createElement(React5.Fragment, null, /* @__PURE__ */ React5.createElement(Text4, { dimColor: true }, " \xB7 "), /* @__PURE__ */ React5.createElement(Text4, null, statusIcon))), !isExpanded && isDone && commandsTree && /* @__PURE__ */ React5.createElement(Box4, { flexDirection: "column", marginLeft: 2, marginTop: 0 }, commandsTree.map((item, i) => /* @__PURE__ */ React5.createElement(Box4, { key: i }, /* @__PURE__ */ React5.createElement(Text4, { dimColor: true }, item.treeChar, " ", item.commandText))))), isExpanded && details && /* @__PURE__ */ React5.createElement(Box4, { flexDirection: "column", marginLeft: 3, marginTop: 1 }, details.files && details.files.length > 0 && /* @__PURE__ */ React5.createElement(Box4, { flexDirection: "column", marginBottom: 1 }, details.files.map((file, i) => /* @__PURE__ */ React5.createElement(Text4, { key: i, dimColor: true }, "  - ", file))), details.commands && details.commands.length > 0 && /* @__PURE__ */ React5.createElement(Box4, { flexDirection: "column" }, details.commands.map((cmd, i) => /* @__PURE__ */ React5.createElement(Text4, { key: i, dimColor: true }, "  ", cmd))), hash && /* @__PURE__ */ React5.createElement(Box4, { marginTop: 1 }, /* @__PURE__ */ React5.createElement(Text4, { dimColor: true }, "  Hash: ", hash))));
}
__name(CommitSection, "CommitSection");

// src/components/tree/proposal-section.js
import React6 from "react";
import { Box as Box5, Text as Text5 } from "ink";
function ProposalSection({ section, isExpanded, isLast, onToggle }) {
  const isApproved = section.metadata?.approved === true;
  const isExecuted = section.metadata?.status === SectionStatus.EXECUTED;
  const isPending = !isApproved && !isExecuted;
  const dotColor = isExecuted ? "cyan" : isApproved ? "green" : "gray";
  const statusIcon = isExecuted ? "\u2713 executed" : isApproved ? "\u2713 approved" : "";
  const details = section.details;
  const files = details?.files || [];
  const description = details?.description || [];
  const truncatedTitle = section.title.length > 60 ? section.title.substring(0, 57) + "\u2026" : section.title;
  return /* @__PURE__ */ React6.createElement(Box5, { flexDirection: "column", marginLeft: 1 }, /* @__PURE__ */ React6.createElement(Box5, null, /* @__PURE__ */ React6.createElement(Text5, { color: dotColor }, "\u23FA "), /* @__PURE__ */ React6.createElement(Text5, { color: dotColor }, truncatedTitle), statusIcon && /* @__PURE__ */ React6.createElement(React6.Fragment, null, /* @__PURE__ */ React6.createElement(Text5, { dimColor: true }, " \xB7 "), /* @__PURE__ */ React6.createElement(Text5, null, statusIcon))), !isExpanded && files.length > 0 && (isApproved || isExecuted) && /* @__PURE__ */ React6.createElement(Box5, { flexDirection: "column", marginLeft: 2, marginTop: 0 }, /* @__PURE__ */ React6.createElement(Text5, { dimColor: true }, "  Files: ", files.join(", "))), isExpanded && /* @__PURE__ */ React6.createElement(Box5, { flexDirection: "column", marginLeft: 3, marginTop: 1 }, files.length > 0 && /* @__PURE__ */ React6.createElement(Box5, { flexDirection: "column", marginBottom: 1 }, /* @__PURE__ */ React6.createElement(Text5, { dimColor: true }, "Files:"), files.map((file, i) => /* @__PURE__ */ React6.createElement(Text5, { key: i, dimColor: true }, "  - ", file))), description.length > 0 && /* @__PURE__ */ React6.createElement(Box5, { flexDirection: "column" }, description.map((desc, i) => /* @__PURE__ */ React6.createElement(Text5, { key: i, dimColor: true }, "  ", desc))), description.length === 0 && section.summary && /* @__PURE__ */ React6.createElement(Box5, null, /* @__PURE__ */ React6.createElement(Text5, { dimColor: true }, "  ", section.summary))));
}
__name(ProposalSection, "ProposalSection");

// src/components/tree/tree-view.js
function filterSections(sections, hideExecutedProposals, hideProposalsDuringApproval) {
  const hasCommitDetails = sections.some((s) => s.type === SectionType.COMMIT_DETAILS);
  return sections.filter((section) => {
    if (section.type === SectionType.COMMIT_PROPOSAL) {
      if (hasCommitDetails) {
        return false;
      }
      if (hideProposalsDuringApproval)
        return false;
      if (hideExecutedProposals) {
        return section.metadata?.status !== SectionStatus.EXECUTED;
      }
    }
    return true;
  });
}
__name(filterSections, "filterSections");
function TreeView({ sections, isActive = false, messageId, hideExecutedProposals = true, hideProposalsDuringApproval = false }) {
  const [expandedIds, setExpandedIds] = useState7(/* @__PURE__ */ new Set());
  const visibleSections = filterSections(sections, hideExecutedProposals, hideProposalsDuringApproval);
  useInput((input, key) => {
    if (key.ctrl && input === "o") {
      const allExpanded = expandedIds.size === visibleSections.length && visibleSections.length > 0;
      if (allExpanded) {
        setExpandedIds(/* @__PURE__ */ new Set());
      } else {
        setExpandedIds(new Set(visibleSections.map((s) => s.id)));
      }
    }
  }, { isActive });
  const toggleSection = /* @__PURE__ */ __name((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, "toggleSection");
  if (visibleSections.length === 0)
    return null;
  const tools = visibleSections.filter((s) => s.type === SectionType.TOOL_USE);
  const running = tools.filter((t) => t.metadata?.status === SectionStatus.RUNNING);
  return /* @__PURE__ */ React7.createElement(Box6, { flexDirection: "column" }, visibleSections.map((section, index) => {
    const isExpanded = expandedIds.has(section.id);
    const isLast = index === visibleSections.length - 1;
    const uniqueKey = messageId ? `${messageId}-${section.id}` : section.id;
    if (section.type === SectionType.TOOL_USE) {
      return /* @__PURE__ */ React7.createElement(ToolSection, { key: uniqueKey, section, isExpanded, isLast, onToggle: () => toggleSection(section.id) });
    }
    if (section.type === SectionType.THINKING) {
      return /* @__PURE__ */ React7.createElement(ThinkingSection, { key: uniqueKey, section, isExpanded, isLast, onToggle: () => toggleSection(section.id) });
    }
    if (section.type === SectionType.COMMIT_DETAILS) {
      return /* @__PURE__ */ React7.createElement(CommitSection, { key: uniqueKey, section, isExpanded, isLast, onToggle: () => toggleSection(section.id) });
    }
    if (section.type === SectionType.COMMIT_PROPOSAL) {
      return /* @__PURE__ */ React7.createElement(ProposalSection, { key: uniqueKey, section, isExpanded, isLast, onToggle: () => toggleSection(section.id) });
    }
    return null;
  }));
}
__name(TreeView, "TreeView");

// src/components/shell/message-stream.js
import gradient2 from "gradient-string";
function stripMarkdown(text) {
  if (!text)
    return "";
  let cleaned = text.replace(/```[\s\S]*?```/g, "").replace(/`([^`]+)`/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\*([^*]+)\*/g, "$1").replace(/^#{1,6}\s+(.+)$/gm, "$1").replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").replace(/^[-*+]\s+(.+)$/gm, "$1").replace(/^\d+\.\s+(.+)$/gm, "$1").replace(/\n{3,}/g, "\n\n");
  cleaned = cleaned.replace(/COMMIT PROPOSAL:[\s\S]*?(?=COMMIT PROPOSAL:|$)/gi, "").trim();
  return cleaned.trim();
}
__name(stripMarkdown, "stripMarkdown");
function MessageStream({ message, sections, isLatest = false, hideProposalsDuringApproval = false }) {
  const hunchyLabel = gradient2(["#0ea5e9", "#06b6d4"]).multiline("Hunchy");
  if (message.role === "agent" && sections.length > 0) {
    const cleanedContent = message.content ? stripMarkdown(message.content) : "";
    return /* @__PURE__ */ React8.createElement(Box7, { flexDirection: "column" }, cleanedContent && /* @__PURE__ */ React8.createElement(Box7, { flexDirection: "column", paddingY: 1 }, /* @__PURE__ */ React8.createElement(Text6, { bold: true }, hunchyLabel, ": "), /* @__PURE__ */ React8.createElement(Text6, null, cleanedContent)), /* @__PURE__ */ React8.createElement(TreeView, { sections, isActive: isLatest, messageId: message.id, hideProposalsDuringApproval }));
  }
  if (message.content) {
    const cleanedContent = message.role === "agent" ? stripMarkdown(message.content) : message.content;
    return /* @__PURE__ */ React8.createElement(Box7, { flexDirection: "column", paddingY: 1 }, message.role === "user" ? /* @__PURE__ */ React8.createElement(Text6, null, "> ", cleanedContent) : /* @__PURE__ */ React8.createElement(React8.Fragment, null, /* @__PURE__ */ React8.createElement(Text6, { bold: true }, hunchyLabel, ": "), /* @__PURE__ */ React8.createElement(Text6, null, cleanedContent)));
  }
  return null;
}
__name(MessageStream, "MessageStream");

// src/components/shell/autocomplete-input.js
import React9, { useState as useState8, useEffect as useEffect5, useCallback as useCallback4 } from "react";
import { Box as Box8, Text as Text7, useInput as useInput2 } from "ink";
import TextInput from "ink-text-input";
function AutocompleteInput({ value, onChange, onSubmit, suggestions, maxSuggestions = 5 }) {
  const [selectedIndex, setSelectedIndex] = useState8(0);
  const [showSuggestions, setShowSuggestions] = useState8(false);
  const displaySuggestions = suggestions.slice(0, maxSuggestions);
  const hasSuggestions = displaySuggestions.length > 0 && value.startsWith("/");
  useEffect5(() => {
    setShowSuggestions(hasSuggestions);
    setSelectedIndex(0);
  }, [value, hasSuggestions]);
  const handleSubmit = useCallback4((inputValue) => {
    if (showSuggestions && selectedIndex >= 0 && selectedIndex < displaySuggestions.length) {
      const selectedCommand = displaySuggestions[selectedIndex];
      onSubmit(`/${selectedCommand.name}`);
      setShowSuggestions(false);
    } else {
      onSubmit(inputValue);
    }
  }, [onSubmit, showSuggestions, selectedIndex, displaySuggestions]);
  useInput2((input, key) => {
    if ((key.meta || key.ctrl) && (key.backspace || key.delete)) {
      onChange("");
      return;
    }
    if (showSuggestions) {
      if (key.upArrow) {
        setSelectedIndex((prev) => prev > 0 ? prev - 1 : displaySuggestions.length - 1);
      } else if (key.downArrow) {
        setSelectedIndex((prev) => prev < displaySuggestions.length - 1 ? prev + 1 : 0);
      } else if (key.tab && !key.shift) {
        if (selectedIndex >= 0 && selectedIndex < displaySuggestions.length) {
          const selectedCommand = displaySuggestions[selectedIndex];
          onChange(`/${selectedCommand.name} `);
          setShowSuggestions(false);
        }
      }
    }
  }, { isActive: true });
  return /* @__PURE__ */ React9.createElement(Box8, { flexDirection: "column" }, /* @__PURE__ */ React9.createElement(Box8, null, /* @__PURE__ */ React9.createElement(Text7, { color: "cyan" }, "> "), /* @__PURE__ */ React9.createElement(TextInput, { value, onChange, onSubmit: handleSubmit })), showSuggestions && displaySuggestions.length > 0 && /* @__PURE__ */ React9.createElement(Box8, { flexDirection: "column", marginTop: 1 }, displaySuggestions.map((cmd, index) => /* @__PURE__ */ React9.createElement(Box8, { key: cmd.name }, /* @__PURE__ */ React9.createElement(Text7, { color: index === selectedIndex ? "cyan" : "gray" }, index === selectedIndex ? "\u25B6 " : "  "), /* @__PURE__ */ React9.createElement(Text7, { color: index === selectedIndex ? "cyan" : "white" }, "/", cmd.name), /* @__PURE__ */ React9.createElement(Text7, { dimColor: true }, " - ", cmd.description)))));
}
__name(AutocompleteInput, "AutocompleteInput");

// src/components/ui/spinner.js
import React10, { useState as useState9, useEffect as useEffect6 } from "react";
import { Box as Box9, Text as Text8 } from "ink";
import InkSpinner from "ink-spinner";
import gradient3 from "gradient-string";
var THINKING_MESSAGES = [
  "Thinking...",
  "Juggling",
  "Wrangling",
  "Untangling",
  "Tinkering",
  "Fiddling",
  "Mulling",
  "Sifting",
  "Weaving",
  "Blending",
  "Cherry-picking",
  "Staging",
  "Branching",
  "Rebasing",
  "Hashing",
  "Diffing",
  "Tweaking",
  "Polishing",
  "Crafting",
  "Musing",
  "Ruminating",
  "Pondering",
  "Scheming",
  "Plotting",
  "Brewing",
  "Concocting",
  "Whipping up",
  "Spinning",
  "Churning",
  "Stirring"
];
function ThinkingSpinner({ text }) {
  const [currentMessage, setCurrentMessage] = useState9(0);
  const blueGradient = gradient3(["#0ea5e9", "#06b6d4"]);
  useEffect6(() => {
    if (text)
      return;
    const interval = setInterval(() => {
      setCurrentMessage(() => Math.floor(Math.random() * THINKING_MESSAGES.length));
    }, 2e3);
    return () => clearInterval(interval);
  }, [text]);
  const displayText = text || THINKING_MESSAGES[currentMessage];
  return /* @__PURE__ */ React10.createElement(Box9, null, /* @__PURE__ */ React10.createElement(Text8, { color: "cyan" }, /* @__PURE__ */ React10.createElement(InkSpinner, { type: "dots" })), /* @__PURE__ */ React10.createElement(Text8, null, " ", blueGradient(displayText)));
}
__name(ThinkingSpinner, "ThinkingSpinner");

// src/components/commit/commit-approval.js
import React11, { useState as useState10 } from "react";
import { Box as Box10, Text as Text9, useInput as useInput3 } from "ink";
import gradient4 from "gradient-string";
function CommitApproval({ commits, onApprove, onReject, onFeedback }) {
  const [selectedIndex, setSelectedIndex] = useState10(commits.length);
  const [isSubmitting, setIsSubmitting] = useState10(false);
  const options = [
    { id: "commit", label: "Commit" },
    { id: "reject", label: "Reject" },
    { id: "feedback", label: "Give feedback" }
  ];
  const totalItems = commits.length + options.length;
  useInput3((input, key) => {
    if (isSubmitting)
      return;
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex((prev) => prev - 1);
    } else if (key.downArrow && selectedIndex < totalItems - 1) {
      setSelectedIndex((prev) => prev + 1);
    } else if (key.return) {
      setIsSubmitting(true);
      if (selectedIndex < commits.length) {
        setSelectedIndex(commits.length);
      } else {
        const actionIndex = selectedIndex - commits.length;
        const selectedOption = options[actionIndex];
        if (selectedOption.id === "commit") {
          onApprove();
        } else if (selectedOption.id === "reject") {
          onReject();
        } else if (selectedOption.id === "feedback" && onFeedback) {
          onReject();
        }
      }
    } else if (key.escape) {
      onReject();
    }
  }, { isActive: true });
  if (commits.length === 0)
    return null;
  const separator = "\u2500".repeat(100);
  return /* @__PURE__ */ React11.createElement(Box10, { flexDirection: "column" }, /* @__PURE__ */ React11.createElement(Text9, null, separator), /* @__PURE__ */ React11.createElement(Box10, { flexDirection: "column", marginTop: 1 }, commits.map((commit, index) => {
    const isSelected = index === selectedIndex;
    const commitGradient = gradient4(["#87ceeb", "#0284c7"])(commit.message);
    return /* @__PURE__ */ React11.createElement(Box10, { key: index, flexDirection: "column" }, /* @__PURE__ */ React11.createElement(Box10, null, /* @__PURE__ */ React11.createElement(Text9, { color: isSelected ? "cyan" : "gray" }, isSelected ? "\u276F " : "  "), /* @__PURE__ */ React11.createElement(Text9, null, index + 1, ". ", commitGradient)), /* @__PURE__ */ React11.createElement(Box10, { flexDirection: "column", marginLeft: 4 }, commit.files.length > 0 && /* @__PURE__ */ React11.createElement(Box10, { flexDirection: "column" }, commit.files.map((file, i) => /* @__PURE__ */ React11.createElement(Text9, { key: i, dimColor: true }, "  - ", file))), isSelected && commit.bullets.length > 0 && /* @__PURE__ */ React11.createElement(Box10, { marginTop: 1, flexDirection: "column" }, commit.bullets.map((bullet, i) => /* @__PURE__ */ React11.createElement(Box10, { key: i }, /* @__PURE__ */ React11.createElement(Text9, { dimColor: true }, "- "), /* @__PURE__ */ React11.createElement(Text9, null, bullet))))));
  })), /* @__PURE__ */ React11.createElement(Box10, { marginTop: 2, marginBottom: 1 }, /* @__PURE__ */ React11.createElement(Text9, { bold: true }, "What do you want to do?")), /* @__PURE__ */ React11.createElement(Box10, { flexDirection: "column", marginTop: 1 }, options.map((option, index) => {
    const itemIndex = commits.length + index;
    const isSelected = itemIndex === selectedIndex;
    return /* @__PURE__ */ React11.createElement(Box10, { key: option.id }, /* @__PURE__ */ React11.createElement(Text9, { color: isSelected ? "cyan" : "gray" }, isSelected ? "\u276F " : "  "), /* @__PURE__ */ React11.createElement(Text9, { color: isSelected ? "cyan" : "white" }, index + 1, ". ", option.label));
  })), /* @__PURE__ */ React11.createElement(Box10, { marginTop: 2 }, /* @__PURE__ */ React11.createElement(Text9, { dimColor: true }, "Enter to confirm \xB7 escape to cancel")));
}
__name(CommitApproval, "CommitApproval");

// src/components/usage/usage-display.js
import React12, { useState as useState11 } from "react";
import { Box as Box11, Text as Text10, useInput as useInput4 } from "ink";
function getResetTime(month) {
  try {
    const [year, monthNum] = month.split("-").map(Number);
    const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
    const nextYear = monthNum === 12 ? year + 1 : year;
    const resetDate = new Date(nextYear, nextMonth - 1, 1, 0, 0, 0);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthName = monthNames[resetDate.getMonth()];
    const day = resetDate.getDate();
    const hours = resetDate.getHours();
    const ampm = hours >= 12 ? "pm" : "am";
    const displayHours = hours % 12 || 12;
    return `Resets ${monthName} ${day}, ${displayHours}${ampm} (UTC)`;
  } catch {
    return "Resets next month";
  }
}
__name(getResetTime, "getResetTime");
function ProgressBar({ used, total, label, color = "blue", resetTime }) {
  if (total === null || total === 0) {
    return /* @__PURE__ */ React12.createElement(Box11, { flexDirection: "column", marginY: 1 }, /* @__PURE__ */ React12.createElement(Box11, null, /* @__PURE__ */ React12.createElement(Text10, null, label)), /* @__PURE__ */ React12.createElement(Box11, null, /* @__PURE__ */ React12.createElement(Text10, { color }, used), " / ", /* @__PURE__ */ React12.createElement(Text10, { dimColor: true }, "Unlimited")), resetTime && /* @__PURE__ */ React12.createElement(Box11, { marginTop: 0 }, /* @__PURE__ */ React12.createElement(Text10, { dimColor: true }, resetTime)));
  }
  const percentage = used / total * 100;
  const barWidth = 50;
  const filledBlocks = Math.min(Math.floor(percentage / 100 * barWidth), barWidth);
  const hasPartial = percentage / 100 * barWidth > filledBlocks && filledBlocks < barWidth;
  const empty = Math.max(0, barWidth - filledBlocks - (hasPartial ? 1 : 0));
  const bar = "\u2588".repeat(filledBlocks) + (hasPartial ? "\u258C" : "") + "\u2591".repeat(empty);
  const countText = `${used}/${total}`;
  const percentageText = `${Math.round(percentage)}%`;
  const remaining = total - used;
  return /* @__PURE__ */ React12.createElement(Box11, { flexDirection: "column", marginY: 1 }, /* @__PURE__ */ React12.createElement(Box11, null, /* @__PURE__ */ React12.createElement(Text10, null, label)), /* @__PURE__ */ React12.createElement(Box11, null, /* @__PURE__ */ React12.createElement(Text10, { color }, bar), /* @__PURE__ */ React12.createElement(Text10, null, "   ", countText, " (", percentageText, ")")), remaining > 0 && /* @__PURE__ */ React12.createElement(Box11, { marginTop: 0 }, /* @__PURE__ */ React12.createElement(Text10, { dimColor: true }, remaining, " remaining")), resetTime && /* @__PURE__ */ React12.createElement(Box11, { marginTop: 0 }, /* @__PURE__ */ React12.createElement(Text10, { dimColor: true }, resetTime)));
}
__name(ProgressBar, "ProgressBar");
function UsageDisplay({ usageData, isLoading, onExit }) {
  const [isActive, setIsActive] = useState11(true);
  useInput4((input, key) => {
    if (key.escape) {
      setIsActive(false);
      onExit();
    }
  }, { isActive });
  const separatorLine = "\u2500".repeat(100);
  if (isLoading || !usageData) {
    return /* @__PURE__ */ React12.createElement(Box11, { flexDirection: "column" }, /* @__PURE__ */ React12.createElement(Text10, null, separatorLine), /* @__PURE__ */ React12.createElement(Text10, null, separatorLine), /* @__PURE__ */ React12.createElement(Box11, { marginTop: 1 }, /* @__PURE__ */ React12.createElement(Text10, { color: "gray" }, "Loading usage data...")), /* @__PURE__ */ React12.createElement(Box11, { marginTop: 2 }, /* @__PURE__ */ React12.createElement(Text10, { dimColor: true }, "escape to cancel")));
  }
  const resetTime = getResetTime(usageData.month);
  const planName = usageData.plan.charAt(0).toUpperCase() + usageData.plan.slice(1);
  return /* @__PURE__ */ React12.createElement(Box11, { flexDirection: "column" }, /* @__PURE__ */ React12.createElement(Text10, null, separatorLine), /* @__PURE__ */ React12.createElement(Text10, null, separatorLine), /* @__PURE__ */ React12.createElement(Box11, { marginTop: 1, flexDirection: "column" }, /* @__PURE__ */ React12.createElement(Box11, { marginBottom: 1 }, /* @__PURE__ */ React12.createElement(Text10, null, "Plan: ", /* @__PURE__ */ React12.createElement(Text10, { color: "cyan", bold: true }, planName))), /* @__PURE__ */ React12.createElement(ProgressBar, { used: usageData.commitsCount, total: usageData.limits.commitsPerMonth, label: "Commits", color: "blue", resetTime })), /* @__PURE__ */ React12.createElement(Box11, { marginTop: 2 }, /* @__PURE__ */ React12.createElement(Text10, { dimColor: true }, "escape to cancel")));
}
__name(UsageDisplay, "UsageDisplay");

// src/utils/commit/proposal-converter.js
function convertProposalsToCommits(proposals) {
  return proposals.filter((section) => section.type === SectionType.COMMIT_PROPOSAL).map((section, index) => {
    const details = section.details;
    const metadata = section.metadata;
    const messageMatch = section.title.match(/^(\w+)\(([^)]+)\):\s*(.+)$/);
    const type = messageMatch ? messageMatch[1] : metadata?.proposalType || "chore";
    const scope = messageMatch ? messageMatch[2] : metadata?.scope || "";
    const message = messageMatch ? messageMatch[3] : section.summary;
    const files = details && Array.isArray(details.files) ? details.files : [];
    let description = [];
    if (details && Array.isArray(details.description)) {
      description = details.description;
    } else if (details?.description) {
      description = typeof details.description === "string" ? [details.description] : Array.isArray(details.description) ? details.description.flat() : [section.summary];
    } else {
      description = [section.summary];
    }
    const complexity = metadata?.complexity ? metadata.complexity.charAt(0).toUpperCase() + metadata.complexity.slice(1) : "Medium";
    return {
      number: index + 1,
      total: proposals.filter((s) => s.type === SectionType.COMMIT_PROPOSAL).length,
      type,
      message: `${type}(${scope}): ${message}`,
      bullets: description,
      files,
      complexity,
      timeEstimate: "",
      // Will be filled during execution
      hash: ""
      // Will be filled after commit is created
    };
  });
}
__name(convertProposalsToCommits, "convertProposalsToCommits");

// src/components/shell/enhanced-shell.js
import gradient5 from "gradient-string";
function EnhancedShell({ onExit, onCommandStart, onCommandEnd }) {
  const app = useApp();
  const { setChatId, setProcessing, setApproval, setCurrentMessage, setSections, isProcessing, isInApproval } = useChatState();
  const { chatId, sendMessage, getState } = useChatIntegration();
  const { getCommand, getSuggestions } = useCommands();
  const [input, setInput] = useState12("");
  const [error, setError] = useState12(null);
  const [commandResult, setCommandResult] = useState12(null);
  const [showCommitSuccess, setShowCommitSuccess] = useState12(false);
  const [showUsage, setShowUsage] = useState12(false);
  const [usageData, setUsageData] = useState12(null);
  const [isUsageLoading, setIsUsageLoading] = useState12(false);
  const [isSubmitting, setIsSubmitting] = useState12(false);
  const state = getState();
  const { executeCommits } = useCommitExecution({
    database: state?.database || null,
    messagesPath: state?.messagesPath || void 0,
    userId: state?.userId || void 0,
    setSections,
    setProcessing,
    setError,
    setShowCommitSuccess,
    setCurrentMessage
  });
  const { messages } = useFirebaseMessages(state?.database || null, chatId, state?.userId ?? void 0, state?.messagesPath ?? void 0);
  useToolRequests(state?.database || null, chatId, state?.userId ?? void 0, state?.messagesPath ?? void 0);
  const suggestions = getSuggestions(input);
  useEffect7(() => {
    if (chatId) {
      setChatId(chatId);
    }
    if (messages.length > 0) {
      const latestMessage2 = messages[messages.length - 1];
      setCurrentMessage(latestMessage2);
      const hasPending = messages.some((m) => m.status === MessageStatus.PENDING);
      setProcessing(hasPending);
    }
  }, [chatId, messages, setChatId, setCurrentMessage, setProcessing]);
  useInput5((input2, key) => {
    if (key.ctrl && input2 === "c") {
      app.exit();
      if (onExit)
        onExit();
    }
    if ((key.meta || key.ctrl) && (key.backspace || key.delete)) {
      if (!isProcessing && !isInApproval && !shouldShowApproval) {
        setInput("");
      }
    }
  }, { isActive: true });
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : void 0;
  const hasExecutingTools = latestMessage?.sections?.some((section) => section.type === SectionType.TOOL_USE && section.metadata?.status === SectionStatus.RUNNING) || false;
  const showSpinner = isProcessing || hasExecutingTools;
  const commitProposals = useMemo3(() => {
    if (!latestMessage?.sections)
      return [];
    return latestMessage.sections.filter((s) => s.type === SectionType.COMMIT_PROPOSAL && !s.metadata?.approved && s.metadata?.status !== SectionStatus.EXECUTED);
  }, [latestMessage]);
  const parsedCommits = useMemo3(() => {
    if (commitProposals.length === 0)
      return [];
    return convertProposalsToCommits(commitProposals);
  }, [commitProposals]);
  const shouldShowApproval = commitProposals.length > 0 && !isInApproval && !showSpinner;
  const handleApprove = /* @__PURE__ */ __name(async () => {
    const commitsToExecute = [...parsedCommits];
    const latestMessage2 = messages.length > 0 ? messages[messages.length - 1] : void 0;
    const preservedSections = latestMessage2?.sections || [];
    setApproval(false);
    setProcessing(true);
    setError(null);
    await executeCommits(commitsToExecute, latestMessage2, preservedSections);
  }, "handleApprove");
  const handleReject = /* @__PURE__ */ __name(() => {
    setApproval(false);
    setCurrentMessage(null);
  }, "handleReject");
  const handleSubmit = /* @__PURE__ */ __name(async (value) => {
    if (!value.trim() || isProcessing || isInApproval || isSubmitting)
      return;
    setIsSubmitting(true);
    setInput("");
    setError(null);
    setCommandResult(null);
    setShowCommitSuccess(false);
    if (value.startsWith("/")) {
      clearScreen();
      onCommandStart?.();
      const parts = value.slice(1).trim().split(/\s+/);
      const commandName = parts[0];
      const args = parts.slice(1);
      const command = getCommand(commandName);
      if (command) {
        try {
          if (commandName === "usage") {
            setShowUsage(true);
            setUsageData(null);
            setIsUsageLoading(true);
          }
          const result = await command.handler(args, {});
          if (commandName === "usage") {
            setUsageData(result);
            setIsUsageLoading(false);
          } else {
            setCommandResult(result);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          setError(errorMsg);
          if (commandName === "usage") {
            setShowUsage(false);
            setIsUsageLoading(false);
          }
        }
      } else {
        setError(`Unknown command: /${commandName}. Type /help for available commands.`);
      }
      onCommandEnd?.();
      setIsSubmitting(false);
      return;
    }
    setProcessing(true);
    try {
      await sendMessage(value);
    } catch (err) {
      setProcessing(false);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  }, "handleSubmit");
  const filteredMessages = useMessageFiltering({
    messages
  });
  if (showUsage) {
    return /* @__PURE__ */ React13.createElement(UsageDisplay, { usageData, isLoading: isUsageLoading, onExit: () => {
      setShowUsage(false);
      setUsageData(null);
      setIsUsageLoading(false);
    } });
  }
  return /* @__PURE__ */ React13.createElement(Box12, { flexDirection: "column" }, error && /* @__PURE__ */ React13.createElement(Box12, { marginBottom: 1 }, /* @__PURE__ */ React13.createElement(Text11, { color: "red" }, "\u2717 ", error)), commandResult && /* @__PURE__ */ React13.createElement(Box12, { flexDirection: "column", marginBottom: 1 }, commandResult.success === false ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement(Text11, { color: "red" }, "\u2717 ", commandResult.message), commandResult.error && /* @__PURE__ */ React13.createElement(Text11, { color: "gray" }, "   ", commandResult.error), commandResult.hint && /* @__PURE__ */ React13.createElement(Text11, { color: "gray" }, "   ", commandResult.hint)) : commandResult.commands ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement(Text11, { color: "cyan" }, "\n", "Available commands:", "\n"), commandResult.commands.map((cmd, idx) => /* @__PURE__ */ React13.createElement(Text11, { key: idx }, /* @__PURE__ */ React13.createElement(Text11, { color: "cyan" }, "  ", cmd.name), /* @__PURE__ */ React13.createElement(Text11, { color: "gray" }, " - ", cmd.description)))) : commandResult.message ? /* @__PURE__ */ React13.createElement(React13.Fragment, null, /* @__PURE__ */ React13.createElement(Text11, { color: "green" }, "\u2713 ", commandResult.message), commandResult.email && /* @__PURE__ */ React13.createElement(Text11, { color: "gray" }, "   Email: ", /* @__PURE__ */ React13.createElement(Text11, { color: "cyan" }, commandResult.email)), commandResult.userId && /* @__PURE__ */ React13.createElement(Text11, { color: "gray" }, "   User ID: ", /* @__PURE__ */ React13.createElement(Text11, { color: "cyan" }, commandResult.userId))) : null), filteredMessages.map(({ message, sections: messageSections }, index) => {
    if (!message.content && messageSections.length === 0) {
      return null;
    }
    const isLatest = message.id === latestMessage?.id;
    const uniqueKey = message.id || `msg-${message.createdAt}-${index}`;
    return /* @__PURE__ */ React13.createElement(MessageStream, { key: uniqueKey, message, sections: messageSections, isLatest, hideProposalsDuringApproval: isInApproval });
  }), showSpinner && /* @__PURE__ */ React13.createElement(ThinkingSpinner, null), showCommitSuccess && /* @__PURE__ */ React13.createElement(Box12, { marginTop: 1, marginBottom: 1 }, /* @__PURE__ */ React13.createElement(Text11, { bold: true }, gradient5(["#10b981", "#059669", "#047857"])("\u2713 All committed"))), shouldShowApproval && /* @__PURE__ */ React13.createElement(CommitApproval, { commits: parsedCommits, onApprove: handleApprove, onReject: handleReject }), !isInApproval && !showSpinner && !shouldShowApproval && /* @__PURE__ */ React13.createElement(AutocompleteInput, { value: input, onChange: setInput, onSubmit: handleSubmit, suggestions }));
}
__name(EnhancedShell, "EnhancedShell");

// src/components/app-with-shell.js
function AppContent({ userEmail, onExit }) {
  const { messages, chatId } = useChatState();
  const [isCommandExecuting, setIsCommandExecuting] = React14.useState(false);
  const showWelcomeScreen = messages.length === 0 && !chatId;
  return /* @__PURE__ */ React14.createElement(Box13, { flexDirection: "column" }, showWelcomeScreen && /* @__PURE__ */ React14.createElement(WelcomeScreen, { userEmail }), /* @__PURE__ */ React14.createElement(EnhancedShell, { onExit, onCommandStart: () => setIsCommandExecuting(true), onCommandEnd: () => setIsCommandExecuting(false) }));
}
__name(AppContent, "AppContent");
function AppWithShell({ userEmail, onExit }) {
  return /* @__PURE__ */ React14.createElement(ChatProvider, null, /* @__PURE__ */ React14.createElement(AppContent, { userEmail, onExit }));
}
__name(AppWithShell, "AppWithShell");

// src/terminal/ink-shell.js
var sleep2 = /* @__PURE__ */ __name((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "sleep");
async function startInkShell(config = {}) {
  if (!process.stdin.isTTY) {
    console.error("Error: Interactive mode requires a TTY terminal");
    console.error("Please run this command directly in your terminal, not through a pipe or redirect");
    process.exit(1);
  }
  process.env.HUNCHY_INTERACTIVE_MODE = "true";
  process.stdout.write("\x1B[2J\x1B[3J\x1B[H");
  await sleep2(100);
  const { waitUntilExit } = render(/* @__PURE__ */ React15.createElement(AppWithShell, { userEmail: config.userEmail, onExit: config.onExit }), {
    stdin: process.stdin,
    stdout: process.stdout,
    stderr: process.stderr
  });
  await waitUntilExit();
}
__name(startInkShell, "startInkShell");

// src/core/command-loader.js
import fs2 from "fs-extra";
import { glob } from "glob";
var CommandLoader = class {
  static {
    __name(this, "CommandLoader");
  }
  commandsPath;
  constructor(commandsPath) {
    this.commandsPath = commandsPath;
  }
  async loadCommands() {
    const commands = [];
    if (!await fs2.pathExists(this.commandsPath)) {
      return commands;
    }
    try {
      const commandFiles = await glob("**/*.{ts,js}", {
        cwd: this.commandsPath,
        absolute: true,
        ignore: ["**/*.d.ts", "**/node_modules/**"]
      });
      for (const filePath of commandFiles) {
        try {
          const module = await import(filePath);
          const command = module.default || module.command;
          if (this.isValidCommand(command)) {
            commands.push(command);
          } else if (Array.isArray(command)) {
            commands.push(...command.filter((c) => this.isValidCommand(c)));
          }
        } catch (error) {
          console.warn(`Failed to load command from ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan commands directory ${this.commandsPath}:`, error);
    }
    return commands;
  }
  isValidCommand(command) {
    return command && typeof command === "object" && typeof command.name === "string" && typeof command.description === "string" && typeof command.handler === "function";
  }
};

// src/core/command-registry.js
var CommandRegistry = class {
  static {
    __name(this, "CommandRegistry");
  }
  commands = /* @__PURE__ */ new Map();
  aliases = /* @__PURE__ */ new Map();
  loader = null;
  constructor(commandsPath) {
    if (commandsPath) {
      this.loader = new CommandLoader(commandsPath);
    }
  }
  register(command) {
    if (this.commands.has(command.name)) {
      throw new Error(`Command "${command.name}" is already registered`);
    }
    this.commands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        if (this.aliases.has(alias)) {
          throw new Error(`Alias "${alias}" is already registered`);
        }
        this.aliases.set(alias, command.name);
      }
    }
  }
  registerMany(commands) {
    for (const command of commands) {
      this.register(command);
    }
  }
  async loadCustomCommands() {
    if (!this.loader) {
      return;
    }
    const commands = await this.loader.loadCommands();
    this.registerMany(commands);
  }
  get(nameOrAlias) {
    const commandName = this.aliases.get(nameOrAlias) || nameOrAlias;
    return this.commands.get(commandName);
  }
  has(nameOrAlias) {
    const commandName = this.aliases.get(nameOrAlias) || nameOrAlias;
    return this.commands.has(commandName);
  }
  getAll() {
    return Array.from(this.commands.values());
  }
  getAllNames() {
    return Array.from(this.commands.keys());
  }
  unregister(name) {
    const command = this.commands.get(name);
    if (!command) {
      return false;
    }
    this.commands.delete(name);
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias);
      }
    }
    return true;
  }
  clear() {
    this.commands.clear();
    this.aliases.clear();
  }
};

// src/config/config-loader.js
import fs3 from "fs-extra";
import path2 from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var __filename = fileURLToPath2(import.meta.url);
var __dirname = path2.dirname(__filename);
var DEFAULT_CONFIG = {
  commands: {
    customPath: ".hunchy/commands"
  },
  analysis: {
    ignorePatterns: ["node_modules", ".git", "dist", "build", ".next"]
  }
};
var ConfigLoader = class {
  static {
    __name(this, "ConfigLoader");
  }
  configPath;
  config;
  constructor(options = {}) {
    const cwd = process.cwd();
    this.configPath = options.configPath || path2.join(cwd, ".hunchy", "config.json");
    this.config = { ...DEFAULT_CONFIG };
  }
  async load() {
    try {
      if (await fs3.pathExists(this.configPath)) {
        const fileContent = await fs3.readJson(this.configPath);
        this.config = {
          ...DEFAULT_CONFIG,
          ...fileContent,
          commands: {
            ...DEFAULT_CONFIG.commands,
            ...fileContent.commands
          },
          analysis: {
            ...DEFAULT_CONFIG.analysis,
            ...fileContent.analysis
          }
        };
      }
    } catch (error) {
      console.warn(`Failed to load config from ${this.configPath}:`, error);
    }
    return this.config;
  }
  async save(config) {
    try {
      await fs3.ensureDir(path2.dirname(this.configPath));
      await fs3.writeJson(this.configPath, config, { spaces: 2 });
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save config to ${this.configPath}: ${error}`);
    }
  }
  getConfig() {
    return this.config;
  }
  getConfigPath() {
    return this.configPath;
  }
};

// src/commands/init-command-ink.js
var sleep3 = /* @__PURE__ */ __name((ms) => new Promise((resolve) => setTimeout(resolve, ms)), "sleep");
async function initializeHunchy() {
  const configLoader = new ConfigLoader();
  const config = await configLoader.load();
  const commandRegistry = new CommandRegistry(config.commands?.customPath || ".hunchy/commands");
  try {
    await commandRegistry.loadCustomCommands();
  } catch (error) {
    console.warn("Failed to load custom commands:", error);
  }
  commandRegistry.register(authCommand);
  return { commandRegistry, configLoader };
}
__name(initializeHunchy, "initializeHunchy");
async function startInkInteractive() {
  await initializeHunchy();
  const configManager = new ConfigManager();
  const userEmail = await configManager.getUserEmail();
  await startInkShell({
    userEmail,
    onExit: () => {
      process.exit(0);
    }
  });
}
__name(startInkInteractive, "startInkInteractive");
function createInkInitCommand() {
  const initCommand = new Command2("init");
  initCommand.description("Initialize Hunchy in your repository (Ink UI)");
  initCommand.action(async () => {
    console.log(chalk3.cyan("\u{1F680} Initializing Hunchy..."));
    console.log("");
    console.log(chalk3.yellow("\u26A0\uFE0F  Early access required"));
    console.log(chalk3.gray("Visit ") + chalk3.cyan("https://hunchy-4a0dc.web.app") + chalk3.gray(" to apply for early access"));
    console.log("");
    console.log(chalk3.gray("You can install the CLI now, but features require authentication."));
    console.log("");
    console.log(chalk3.gray("Starting interactive mode..."));
    console.log("");
    await sleep3(1e3);
    await startInkInteractive();
  });
  return initCommand;
}
__name(createInkInitCommand, "createInkInitCommand");
async function runInkInit() {
  try {
    await initializeHunchy();
    const configManager = new ConfigManager();
    const userEmail = await configManager.getUserEmail();
    await startInkShell({
      userEmail,
      onExit: () => {
        process.exit(0);
      }
    });
  } catch (error) {
    console.error(chalk3.red("\n\u2717 Failed to start Hunchy"));
    console.error(chalk3.gray("Error: "), error);
    process.exit(1);
  }
}
__name(runInkInit, "runInkInit");

// src/commands/chat-command-ink.js
import { Command as Command3 } from "commander";
import chalk4 from "chalk";
async function startChatMode() {
  const apiClient = new ApiClient();
  try {
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      console.log(chalk4.red("\n\u2717 Not authenticated"));
      console.log(chalk4.gray("   Please run: ") + chalk4.cyan("hunchy auth"));
      process.exit(1);
    }
    const configManager = apiClient.getConfigManager();
    const userEmail = await configManager.getUserEmail();
    const backendClient = apiClient.getBackendClient();
    if (!(backendClient instanceof DefaultClient)) {
      console.log(chalk4.red("\n\u2717 Backend client not initialized"));
      process.exit(1);
    }
    await backendClient.initialize();
    const customToken = await configManager.getCustomToken();
    const authTokenService = new AuthTokenService(apiClient);
    try {
      const idToken = await authTokenService.getAuthTokenOrThrow();
      if (customToken && idToken) {
        await backendClient.authenticate(idToken, customToken);
      }
    } catch {
      console.log(chalk4.red("\n\u2717 Not authenticated"));
      console.log(chalk4.gray("   Please run: ") + chalk4.cyan("hunchy auth"));
      process.exit(1);
    }
    await startInkShell({
      userEmail,
      onExit: () => {
        process.exit(0);
      }
    });
  } catch (error) {
    console.log(chalk4.red("\n\u2717 Failed to start chat"));
    console.log(chalk4.gray("Error: " + error.message));
    process.exit(1);
  }
}
__name(startChatMode, "startChatMode");
function createInkChatCommand() {
  const chatCommand = new Command3("chat");
  chatCommand.description("Start interactive chat with Hunchy (Ink UI)");
  chatCommand.option("-l, --local", "Use local Firebase emulators for development");
  chatCommand.action(async (options) => {
    if (options.local) {
      process.env.HUNCHY_USE_EMULATORS = "true";
      process.env.HUNCHY_LOCAL_MODE = "true";
      console.log(chalk4.gray("\u{1F527} Using local Firebase emulators\n"));
    }
    await startChatMode();
  });
  return chatCommand;
}
__name(createInkChatCommand, "createInkChatCommand");

// src/index.ts
var __filename2 = fileURLToPath3(import.meta.url);
var __dirname2 = dirname2(__filename2);
var packageJsonPath = join3(__dirname2, "..", "package.json");
var packageJson = JSON.parse(readFileSync3(packageJsonPath, "utf-8"));
var version = packageJson.version || "0.0.1";
var program = new Command4();
program.name("hunchy").description("AI-powered commit intelligence").version(version).option("--local", "Run in local mode with emulators (no auth required)").hook("preAction", (thisCommand) => {
  if (thisCommand.opts().local) {
    process.env.HUNCHY_USE_EMULATORS = "true";
    process.env.HUNCHY_LOCAL_MODE = "true";
  }
});
program.addCommand(createAuthCommand());
program.addCommand(createLogoutCommand());
program.addCommand(createStatusCommand());
program.addCommand(createInkInitCommand());
program.addCommand(createInkChatCommand());
(async () => {
  const args = process.argv.slice(2);
  const hasCommand = args.some((arg) => !arg.startsWith("-"));
  if (args.length === 0 || !hasCommand) {
    if (args.includes("--local")) {
      process.env.HUNCHY_USE_EMULATORS = "true";
      process.env.HUNCHY_LOCAL_MODE = "true";
    }
    await runInkInit();
  } else {
    program.parse();
  }
})();
