import { HttpsError } from "firebase-functions/v2/https";
import { container } from "../invercify.config";
import { FirebaseService } from "../services/FirebaseService";
import { UserService } from "../services/UserService";
export interface AuthRequest {
  auth?: {
    uid?: string;
    token?: {
      sub?: string;
      uid?: string;
      email?: string;
      [key: string]: any;
    };
  };
  rawRequest?: {
    headers?: {
      authorization?: string;
    };
  };
}
export const checkAuth = async (request: AuthRequest, firebaseService?: FirebaseService): Promise<string> => {
  let uid = request.auth?.uid;
  console.log('[checkAuth] Initial check:', {
    uid,
    hasRawRequest: !!request.rawRequest,
    hasHeaders: !!request.rawRequest?.headers,
    hasAuthorization: !!request.rawRequest?.headers?.authorization,
    uidIncludesAt: uid?.includes('@')
  });
  if (uid && uid.includes('@') && request.rawRequest?.headers?.authorization) {
    try {
      const authHeader = request.rawRequest.headers.authorization;
      if (!authHeader) {
        console.warn('[checkAuth] No authorization header found');
      } else {
        const idToken = authHeader.replace(/^Bearer\s+/i, '');
        console.log('[checkAuth] Attempting to decode JWT, token length:', idToken.length);
        const parts = idToken.split('.');
        console.log('[checkAuth] JWT parts count:', parts.length);
        if (parts.length === 3) {
          let payload = parts[1];
          payload = payload.replace(/-/g, '+').replace(/_/g, '/');
          while (payload.length % 4) {
            payload += '=';
          }
          const decoded = JSON.parse(Buffer.from(payload, 'base64').toString()) as { uid?: string };
          console.log('[checkAuth] Decoded JWT payload:', { uid: decoded.uid, hasUid: !!decoded.uid, uidType: typeof decoded.uid });
          if (decoded.uid && typeof decoded.uid === 'string' && !decoded.uid.includes('@')) {
            uid = decoded.uid;
            console.log('[checkAuth] Using UID from decoded JWT payload (emulator workaround):', uid);
            return uid;
          } else {
            console.warn('[checkAuth] Decoded UID is invalid:', { decodedUid: decoded.uid, includesAt: decoded.uid?.includes('@') });
          }
        } else {
          console.warn('[checkAuth] Invalid JWT format, expected 3 parts, got:', parts.length);
        }
      }
    } catch (error) {
      console.warn('[checkAuth] Failed to decode idToken, falling back to request.auth?.uid:', error);
    }
  }
  if (!uid) {
    console.error("Unauthorized access attempt", { uid, token: request.auth?.token });
    throw new HttpsError("unauthenticated", "User must be authenticated");
  }
  return uid;
};
export const checkAuthAndUser = async (request: AuthRequest, firebaseService?: FirebaseService): Promise<string> => {
  const uid = await checkAuth(request, firebaseService);
  try {
    const userService = container.get(UserService);
    const user = await userService.getUser(uid);
    if (!user) {
      const email = request.auth?.token?.email || "";
      console.log("User not found, creating automatically", { uid, email });
      await userService.getOrCreateUser(uid, email);
    }
  } catch (error) {
    if (error instanceof HttpsError) {
      throw error;
    }
    console.error("Error ensuring user exists", { uid, error });
    throw new HttpsError("internal", "Failed to ensure user exists. Please contact support.");
  }
  return uid;
};
