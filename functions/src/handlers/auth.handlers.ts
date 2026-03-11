import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onValueUpdated } from "firebase-functions/v2/database";
import { container } from "../invercify.config";
import { FirebaseService } from "../services/FirebaseService";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import { checkAuth, type AuthRequest } from "./auth.utils";
export const apiV1GetUser = onCall<void, Promise<any>>(
  async (request: AuthRequest): Promise<any> => {
    const firebaseService = container.get(FirebaseService);
    const uid = await checkAuth(request, firebaseService);
    const email = request.auth?.token?.email;
    if (!email) {
      console.error("Unauthorized access attempt - no email", { uid });
      throw new HttpsError("unauthenticated", "User email is required");
    }
    const userService = container.get(UserService);
    return userService.getOrCreateUser(uid, email);
  }
);
export const initCliAuth = onCall<{ deviceCode: string; expiresIn?: number }>(
  async (request) => {
    const { deviceCode, expiresIn = 600 } = request.data;
    if (!deviceCode) {
      throw new HttpsError("invalid-argument", "deviceCode is required");
    }
    const authService = container.get(AuthService);
    return await authService.initCliAuth(deviceCode, expiresIn);
  }
);
export const pollCliAuth = onCall<{ deviceCode: string }>(
  async (request) => {
    const { deviceCode } = request.data;
    if (!deviceCode) {
      throw new HttpsError("invalid-argument", "deviceCode is required");
    }
    const authService = container.get(AuthService);
    const firebaseService = container.get(FirebaseService);
    const deviceRef = firebaseService.database().ref(`cliAuth/${deviceCode}`);
    const snapshot = await deviceRef.get();
    if (!snapshot.exists()) {
      throw new HttpsError("not-found", "Device code not found");
    }
    return await authService.pollCliAuth(deviceCode);
  }
);
export const completeCliAuth = onValueUpdated(
  {
    ref: "/cliAuth/{deviceCode}",
    region: "us-central1"
  },
  async (event) => {
    const deviceCode = event.params.deviceCode;
    const before = event.data.before.val();
    const after = event.data.after.val();
    console.log("CLI auth update detected", { deviceCode, before, after });
    if (after.status !== "approved" || after.customToken) {
      console.log("Skipping - not approved or already completed", {
        status: after.status,
        hasCustomToken: !!after.customToken
      });
      return;
    }
    const userId = after.userId;
    if (!userId) {
      console.error("No userId found in approved auth entry", { deviceCode });
      return;
    }
    const authService = container.get(AuthService);
    await authService.completeCliAuth(
      deviceCode,
      userId,
      before?.status || "",
      after.status,
      event.data.after.ref
    );
  }
);
