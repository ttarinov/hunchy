import type { SessionRequest, ProgressUpdate, SessionResult, DeviceAuthResult } from "../types/client.js";
export interface BackendClient {
  initialize(): Promise<void>;
  authenticate(idToken: string, customToken?: string): Promise<string>;
  generateDeviceCode(): string;
  createDeviceAuthEntry(deviceCode: string, expiresIn?: number): Promise<void>;
  pollDeviceAuth(
    deviceCode: string,
    interval?: number,
    maxAttempts?: number
  ): Promise<DeviceAuthResult>;
  generateSessionId(): string;
  writeRequest(sessionId: string, request: SessionRequest): Promise<void>;
  subscribeToProgress(
    sessionId: string,
    callback: (progress: ProgressUpdate) => void
  ): Promise<() => void>;
  waitForResult(sessionId: string, timeoutMs?: number): Promise<SessionResult>;
  cleanup(sessionId: string): Promise<void>;
  getCliAuthPath(): Promise<string>;
  getSessionsPath(): Promise<string>;
  isAvailable(): Promise<boolean>;
}
