export interface SessionRequest {
  changes: any;
  files: any;
  timestamp: number;
  userId?: string;
}
export interface ProgressUpdate {
  step: string;
  timestamp: number;
  details?: string;
}
export interface SessionResult {
  commits: Array<{
    message: string;
    files: string[];
    description?: string;
  }>;
  timestamp: number;
  success: boolean;
  error?: string;
}
export interface DeviceAuthResult {
  idToken: string;
  refreshToken: string;
  userId: string;
  email?: string;
  customToken?: string;
  config?: any;
}
