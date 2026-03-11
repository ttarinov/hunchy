import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { container } from "../../invercify.config";
import { FirebaseService } from "../../services/FirebaseService";
import { AuthService } from "../../services/AuthService";
import * as crypto from "crypto";
interface CliTokenPayload {
  userId: string;
  email: string;
  createdAt: number;
  expiresAt: number;
}
export async function verifyCliToken(authHeader: string | undefined): Promise<CliTokenPayload> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new HttpsError('unauthenticated', 'Missing or invalid Authorization header');
  }
  const token = authHeader.substring(7); 
  const firebaseService = container.get(FirebaseService);
  try {
    const decodedToken = await firebaseService.auth().verifyIdToken(token);
    return {
      userId: decodedToken.uid,
      email: decodedToken.email || '',
      createdAt: decodedToken.iat * 1000,
      expiresAt: decodedToken.exp * 1000
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new HttpsError('unauthenticated', 'Invalid or expired token');
  }
}
export const cliAuthInit = onCall<{ deviceCode?: string }>(
  async (request) => {
    const deviceCode = request.data.deviceCode || crypto.randomBytes(4).toString('hex').toUpperCase();
    const expiresIn = 600; 
    const authService = container.get(AuthService);
    await authService.initCliAuth(deviceCode, expiresIn);
    return {
      deviceCode,
      userCode: deviceCode.substring(0, 4), 
      verificationUrl: `${process.env.WEB_URL || 'https://hunchy-4a0dc.web.app'}/auth/cli?device_code=${deviceCode}`,
      expiresIn,
      interval: 5 
    };
  }
);
export const cliAuthPoll = onCall<{ deviceCode: string }>(
  async (request) => {
    const { deviceCode } = request.data;
    if (!deviceCode) {
      throw new HttpsError('invalid-argument', 'deviceCode is required');
    }
    const authService = container.get(AuthService);
    const result = await authService.pollCliAuth(deviceCode);
    if (result.status === 'approved' && result.customToken) {
      const firebaseService = container.get(FirebaseService);
      const userId = result.userId;
      const userRef = firebaseService.database().ref(`users/${userId}`);
      const userSnapshot = await userRef.get();
      const userData = userSnapshot.val();
      return {
        status: 'approved',
        token: result.customToken,
        userId,
        email: userData?.email || '',
        config: {
          apiUrl: process.env.API_URL || 'https://hunchy-4a0dc.web.app/api',
          webUrl: process.env.WEB_URL || 'https://hunchy-4a0dc.web.app'
        }
      };
    }
    return {
      status: result.status || 'pending'
    };
  }
);
export const cliGetConfig = onRequest(async (req, res) => {
  try {
    const tokenPayload = await verifyCliToken(req.headers.authorization);
    const firebaseService = container.get(FirebaseService);
    const userRef = firebaseService.database().ref(`users/${tokenPayload.userId}`);
    const snapshot = await userRef.get();
    const userData = snapshot.val();
    res.json({
      userId: tokenPayload.userId,
      email: tokenPayload.email,
      config: {
        apiUrl: process.env.API_URL || 'https://hunchy-4a0dc.web.app/api',
        webUrl: process.env.WEB_URL || 'https://hunchy-4a0dc.web.app',
        databasePath: `users/${tokenPayload.userId}`,
        features: userData?.features || {}
      }
    });
  } catch (error) {
    if (error instanceof HttpsError) {
      res.status(error.httpErrorCode.status).json({ error: error.message });
    } else {
      console.error('Error getting config:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});
export const cliVerifyToken = onRequest(async (req, res) => {
  try {
    const tokenPayload = await verifyCliToken(req.headers.authorization);
    res.json({
      valid: true,
      userId: tokenPayload.userId,
      email: tokenPayload.email,
      expiresAt: tokenPayload.expiresAt
    });
  } catch (error) {
    res.status(401).json({
      valid: false,
      error: error instanceof HttpsError ? error.message : 'Invalid token'
    });
  }
});
