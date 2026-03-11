import { onCall, HttpsError } from "firebase-functions/v2/https";
import { container } from "../invercify.config";
import { SystemUserService } from "../services/SystemUserService";
import { SystemUserCreateRequest, SystemUserData } from "../models/SystemUserModel";
const checkAdminAuth = async (request: any): Promise<string> => {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required");
  }
  const role = request.auth?.token?.role;
  if (role !== "admin") {
    const systemUserService = container.get(SystemUserService);
    const systemUser = await systemUserService.getSystemUser(uid);
    if (systemUser?.role !== "admin") {
      throw new HttpsError("permission-denied", "Admin access required");
    }
  }
  return uid;
};
export const apiV1GetSystemUser = onCall<void, Promise<SystemUserData | null>>(
  async (request): Promise<SystemUserData | null> => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError("unauthenticated", "Authentication required");
    }
    const systemUserService = container.get(SystemUserService);
    const systemUser = await systemUserService.getSystemUser(uid);
    return systemUser;
  }
);
export const apiV1AdminCreateSystemUser = onCall<SystemUserCreateRequest, Promise<SystemUserData>>(
  async (request): Promise<SystemUserData> => {
    await checkAdminAuth(request);
    const systemUserService = container.get(SystemUserService);
    return await systemUserService.createSystemUser(request.data);
  }
);
export const apiV1AdminUpdateSystemUser = onCall<{ userId: string; updates: Partial<SystemUserData> }, Promise<void>>(
  async (request): Promise<void> => {
    await checkAdminAuth(request);
    const { userId, updates } = request.data;
    if (!userId) {
      throw new HttpsError("invalid-argument", "User ID is required");
    }
    const systemUserService = container.get(SystemUserService);
    await systemUserService.updateSystemUser(userId, updates);
  }
);
export const apiV1AdminDeleteSystemUser = onCall<{ userId: string }, Promise<void>>(
  async (request): Promise<void> => {
    await checkAdminAuth(request);
    const { userId } = request.data;
    if (!userId) {
      throw new HttpsError("invalid-argument", "User ID is required");
    }
    const systemUserService = container.get(SystemUserService);
    await systemUserService.deleteSystemUser(userId);
  }
);
