import { initializeApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";
import { getAuth, Auth } from "firebase/auth";
import { ConfigManager } from "../auth/config-manager.js";
import { shouldUseEmulators, connectToEmulators } from "../utils/emulator-config.js";
import { AuthError } from "../utils/errors.js";
export interface FirebaseServices {
  app: FirebaseApp;
  database: Database;
  auth: Auth;
}
export async function initializeFirebase(configManager: ConfigManager): Promise<FirebaseServices> {
  const isLocalMode = process.env.HUNCHY_LOCAL_MODE === "true" || process.env.HUNCHY_USE_EMULATORS === "true";
  let backendConfig = await configManager.getBackendConfig();
  if (isLocalMode && !backendConfig) {
    backendConfig = {
      apiKey: "AIzaSyDemoKeyForEmulatorUseOnly1234567890",
      authEndpoint: "localhost",
      serviceUrl: "http://localhost:9000",
      project: "demo-project",
    };
  }
  if (!backendConfig) {
    throw new AuthError(
      "Not authenticated. Please run 'hunchy auth' or '/auth' command to authenticate and receive configuration."
    );
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
    projectId: backendConfig.project,
  };
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth(app);
  if (useEmulators) {
    await connectToEmulators(auth, database);
  }
  return { app, database, auth };
}
