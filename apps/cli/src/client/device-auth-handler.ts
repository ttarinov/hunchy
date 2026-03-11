import { ref, set, get, Database } from "firebase/database";
import type { DeviceAuthResult } from "../types/client.js";
import { AuthError, TimeoutError, BackendError } from "../utils/errors.js";
import { getStableDeviceId } from "../utils/device-id.js";
export class DeviceAuthHandler {
  constructor(private database: Database, private cliAuthPath: string) {}
  generateDeviceCode(): string {
    return getStableDeviceId();
  }
  async createDeviceAuthEntry(deviceCode: string, expiresIn: number = 600): Promise<void> {
    const deviceRef = ref(this.database, `${this.cliAuthPath}/${deviceCode}`);
    const now = Date.now();
    await set(deviceRef, {
      status: "pending",
      createdAt: now,
      expiresAt: now + expiresIn * 1000,
    });
  }
  async pollDeviceAuth(
    deviceCode: string,
    interval: number = 2,
    maxAttempts: number = 300
  ): Promise<DeviceAuthResult> {
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
            config: data.config,
          };
        }
        if (data.expiresAt && data.expiresAt < Date.now()) {
          await set(deviceRef, { status: "expired" });
          throw new AuthError("Authentication expired. Please try again.");
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
        attempts++;
      } catch (error) {
        if (attempts >= maxAttempts - 1) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, interval * 1000));
        attempts++;
      }
    }
    throw new TimeoutError("Authentication timeout. Please try again.");
  }
}
