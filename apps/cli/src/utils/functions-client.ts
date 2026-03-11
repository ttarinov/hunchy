import { FIREBASE_PROJECT_ID, FIREBASE_REGION } from "./constants.js";
const getEmulatorUrl = (functionName: string): string => {
  return `http://localhost:5001/${FIREBASE_PROJECT_ID}/${FIREBASE_REGION}/${functionName}`;
};
const getProductionUrl = (functionName: string): string => {
  return `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/${functionName}`;
};
function isEmulatorMode(): boolean {
  return process.env.HUNCHY_LOCAL_MODE === "true" || 
         process.env.HUNCHY_USE_EMULATORS === "true";
}
export async function callFunction<T = any>(
  functionName: string,
  data: any = {},
  idToken?: string
): Promise<T> {
  const isEmulator = isEmulatorMode();
  const url = isEmulator ? getEmulatorUrl(functionName) : getProductionUrl(functionName);
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (idToken) {
    headers["Authorization"] = `Bearer ${idToken}`;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({ data }),
    });
    if (!response.ok) {
      if (response.status === 404 && !isEmulator) {
        const emulatorUrl = getEmulatorUrl(functionName);
        console.log(`Trying emulator at ${emulatorUrl}...`);
        const emulatorResponse = await fetch(emulatorUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ data }),
        });
        if (emulatorResponse.ok) {
          const result: any = await emulatorResponse.json();
          return result.result as T;
        }
      }
      const error: any = await response.json().catch(() => ({}));
      throw new Error(
        error.error?.message || `Function call failed: ${response.statusText}`
      );
    }
    const result: any = await response.json();
    return result.result as T;
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
        if (!isEmulator) {
          const emulatorUrl = getEmulatorUrl(functionName);
          try {
            const emulatorResponse = await fetch(emulatorUrl, {
              method: "POST",
              headers,
              body: JSON.stringify({ data }),
            });
            if (emulatorResponse.ok) {
              const result: any = await emulatorResponse.json();
              return result.result as T;
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
