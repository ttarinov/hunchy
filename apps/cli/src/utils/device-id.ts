import { machineIdSync } from "node-machine-id";
import { createHash } from "crypto";
import * as fs from "fs-extra";
import * as path from "path";
import * as os from "os";

export function getStableDeviceId(): string {
  const configDir = path.join(os.homedir(), ".hunchy");
  const deviceIdFile = path.join(configDir, "device-id");
  if (fs.existsSync(deviceIdFile)) {
    try {
      const cachedId = fs.readFileSync(deviceIdFile, "utf-8").trim();
      if (cachedId && cachedId.startsWith("hunchy_")) {
        return cachedId;
      }
    } catch (error) {
      console.warn("Failed to read cached device ID, generating new one");
    }
  }
  try {
    const machineId = machineIdSync(true);
    const hash = createHash("sha256").update(machineId).digest("hex");
    const deviceId = `hunchy_${hash.substring(0, 16)}`;
    try {
      fs.ensureDirSync(configDir);
      fs.writeFileSync(deviceIdFile, deviceId, "utf-8");
    } catch (error) {
      console.warn("Failed to cache device ID:", error);
    }
    return deviceId;
  } catch (error) {
    console.error("Failed to generate stable device ID:", error);
    const fallbackId = `hunchy_fallback_${Date.now()}`;
    try {
      fs.ensureDirSync(configDir);
      fs.writeFileSync(deviceIdFile, fallbackId, "utf-8");
    } catch (writeError) {
      console.warn("Failed to cache fallback device ID:", writeError);
    }
    return fallbackId;
  }
}
