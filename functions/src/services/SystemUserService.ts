import { injectable } from "inversify";
import { FirebaseService } from "./FirebaseService";
import { SystemUserCreateRequest, SystemUserData, SystemUserRole } from "../models/SystemUserModel";
@injectable()
export class SystemUserService {
  constructor(private firebaseService: FirebaseService) {}
  public async getSystemUser(uid: string): Promise<SystemUserData | null> {
    const adminRef = this.firebaseService.database().ref(`systemUsers/${uid}`);
    const adminSnapshot = await adminRef.get();
    if (!adminSnapshot.exists()) {
      return null;
    }
    return {
      _key: uid,
      ...adminSnapshot.val()
    } as SystemUserData;
  }
  public async createSystemUser(userData: SystemUserCreateRequest): Promise<SystemUserData> {
    const userRecord = await this.firebaseService.auth().createUser({
      email: userData.email,
      displayName: userData.name || undefined,
    });
    const uid = userRecord.uid;
    await this.firebaseService.auth().setCustomUserClaims(uid, { role: userData.role });
    const systemUser: Omit<SystemUserData, "_key"> = {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const adminRef = this.firebaseService.database().ref(`systemUsers/${uid}`);
    await adminRef.set(systemUser);
    return {
      _key: uid,
      ...systemUser,
    };
  }
  public async updateSystemUser(uid: string, updates: Partial<SystemUserData>): Promise<void> {
    const adminRef = this.firebaseService.database().ref(`systemUsers/${uid}`);
    await adminRef.update({
      ...updates,
      updatedAt: Date.now(),
    });
    if (updates.role) {
      await this.firebaseService.auth().setCustomUserClaims(uid, { role: updates.role });
    }
    if (updates.name || updates.email) {
      await this.firebaseService.auth().updateUser(uid, {
        displayName: updates.name,
        email: updates.email,
      });
    }
  }
  public async deleteSystemUser(uid: string): Promise<void> {
    const adminRef = this.firebaseService.database().ref(`systemUsers/${uid}`);
    await adminRef.remove();
    await this.firebaseService.auth().deleteUser(uid);
  }
  public async isAdmin(uid: string): Promise<boolean> {
    const systemUser = await this.getSystemUser(uid);
    return systemUser?.role === SystemUserRole.ADMIN;
  }
}
