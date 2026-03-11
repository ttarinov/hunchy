export const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || "hunchy-4a0dc";
export const FIREBASE_REGION = "us-central1";
const isEmulator = process.env.HUNCHY_USE_EMULATORS === "true" ||
                   process.env.FIREBASE_EMULATOR_HUB !== undefined ||
                   process.env.FIREBASE_AUTH_EMULATOR_HOST !== undefined ||
                   process.env.FIREBASE_DATABASE_EMULATOR_HOST !== undefined;
export const FUNCTIONS_BASE_URL = isEmulator
  ? `http://localhost:5001/${FIREBASE_PROJECT_ID}/${FIREBASE_REGION}`
  : `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net`;
export const WEBSITE_URL = process.env.HUNCHY_WEBSITE_URL ||
                           (isEmulator ? "http://localhost:3000" : "https://hunchy-4a0dc.web.app");
export const AUTH_PAGE_PATH = "/auth/cli";
export const DEVICE_CODE_EXPIRES_IN = 600; 
export const POLL_INTERVAL = 2; 
export const MAX_POLL_ATTEMPTS = 300; 
