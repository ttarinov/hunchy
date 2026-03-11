import { injectable } from "inversify";
import admin from "firebase-admin";
@injectable()
export class FirebaseService {
  public app = admin.initializeApp({
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://hunchy-4a0dc-default-rtdb.firebaseio.com"
  });
  public database(): admin.database.Database {
    return this.app.database();
  }
  public auth(): admin.auth.Auth {
    return this.app.auth();
  }
  public key(prefix?: string): string {
    const timestampPart = Date.now().toString(16);
    const randomPart = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)
      .toString(16)
      .padStart(16, "0");
    const prefixString = prefix || "";
    return `${prefixString}${timestampPart}${randomPart}`;
  }
}
