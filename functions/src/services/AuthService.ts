import { injectable } from "inversify";
import { FirebaseService } from "./FirebaseService";
import type { Reference } from "firebase-admin/database";
@injectable()
export class AuthService {
  constructor(
    private firebaseService: FirebaseService
  ) { }
  public async initCliAuth(deviceCode: string, expiresIn: number = 600): Promise<{
    success: boolean;
    deviceCode: string;
    expiresAt: number;
  }> {
    const deviceRef = this.firebaseService.database().ref(`cliAuth/${deviceCode}`);
    const now = Date.now();
    await deviceRef.set({
      status: "pending",
      createdAt: now,
      expiresAt: now + expiresIn * 1000,
    });
    console.log("CLI auth initialized", { deviceCode, expiresAt: now + expiresIn * 1000 });
    return {
      success: true,
      deviceCode,
      expiresAt: now + expiresIn * 1000,
    };
  }
  public async pollCliAuth(deviceCode: string): Promise<{
    status: string;
    idToken?: string;
    refreshToken?: string;
    userId?: string;
    email?: string;
    customToken?: string;
    config?: unknown;
  }> {
    const deviceRef = this.firebaseService.database().ref(`cliAuth/${deviceCode}`);
    const snapshot = await deviceRef.get();
    if (!snapshot.exists()) {
      throw new Error("Device code not found");
    }
    const data = snapshot.val();
    if (data.expiresAt && Date.now() > data.expiresAt) {
      return { status: "expired" };
    }
    if (data.status === "completed" && data.customToken) {
      return {
        status: "completed",
        idToken: data.customToken,
        refreshToken: data.refreshToken || "",
        userId: data.userId,
        email: data.email,
        customToken: data.customToken,
        config: data.config,
      };
    }
    return { status: data.status || "pending" };
  }
  public async generateAndStoreConfig(userId: string, email: string): Promise<{
    backend: {
      apiKey: string;
      authEndpoint: string;
      serviceUrl: string;
      project: string;
    };
    paths: {
      cliAuth: string;
      sessions: string;
      chats: string;
      messages: string;
    };
    website: {
      url: string;
      authPath: string;
    };
  }> {
    const firebaseConfig = {
      apiKey: process.env.FIREBASE_API_KEY || "",
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
      databaseURL: process.env.FIREBASE_DATABASE_URL || "",
      projectId: process.env.FIREBASE_PROJECT_ID || ""
    };
    const websiteUrl = process.env.WEBSITE_URL || "";
    return {
      backend: {
        apiKey: firebaseConfig.apiKey,
        authEndpoint: firebaseConfig.authDomain,
        serviceUrl: firebaseConfig.databaseURL,
        project: firebaseConfig.projectId
      },
      paths: {
        cliAuth: "cliAuth",
        sessions: "sessions",
        chats: "chats",
        messages: "messages"
      },
      website: {
        url: websiteUrl,
        authPath: "/auth/cli"
      }
    };
  }
  public async completeCliAuth(
    deviceCode: string,
    userId: string,
    beforeStatus: string,
    afterStatus: string,
    deviceRef: Reference
  ): Promise<void> {
    if (afterStatus !== "approved") {
      return;
    }
    try {
      const userRecord = await this.firebaseService.auth().getUser(userId);
      const customToken = await this.firebaseService.auth().createCustomToken(userId);
      console.log("Custom token generated", { deviceCode, userId });
      const config = await this.generateAndStoreConfig(userId, userRecord.email || "");
      await deviceRef.update({
        status: "completed",
        customToken,
        idToken: customToken,
        email: userRecord.email,
        config
      });
      console.log("CLI auth completed successfully", { deviceCode, userId, email: userRecord.email });
    } catch (error) {
      console.error("Error completing CLI auth", { deviceCode, userId, error });
      await deviceRef.update({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
      throw error;
    }
  }
}
