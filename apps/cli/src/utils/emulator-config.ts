import { connectAuthEmulator, Auth } from "firebase/auth";
import { connectDatabaseEmulator, Database } from "firebase/database";
export function shouldUseEmulators(serviceUrl?: string): boolean {
  if (process.env.HUNCHY_USE_EMULATORS === "true" || process.env.HUNCHY_LOCAL_MODE === "true") {
    return true;
  }
  if (serviceUrl) {
    return (
      serviceUrl.includes("localhost") ||
      serviceUrl.includes("127.0.0.1") ||
      serviceUrl.includes("::1")
    );
  }
  return false;
}
export async function connectToEmulators(
  auth: Auth,
  database: Database
): Promise<void> {
  if (!shouldUseEmulators()) {
    return;
  }
  try {
    const host = "localhost";
    try {
      connectAuthEmulator(auth, `http://${host}:9099`, {
        disableWarnings: true,
      });
    } catch (error) {
    }
    try {
      const dbInfo = (database as unknown as { _delegate?: { _repo?: { repoInfo_?: { host?: string } } } })._delegate?._repo?.repoInfo_?.host;
      if (!dbInfo?.includes("localhost")) {
        connectDatabaseEmulator(database, host, 9000);
      }
    } catch (error) {
    }
  } catch (error) {
  }
}
