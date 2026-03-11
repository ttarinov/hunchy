import { injectable } from "inversify";
import { FirebaseService } from "./FirebaseService";
import { UserModel, ClientData } from "../models/UserModel";
@injectable()
export class UserService {
  constructor(
    private firebaseService: FirebaseService
  ) {}
  public async getOrCreateUser(
    uid: string,
    email: string
  ): Promise<ClientData> {
    const userRef = this.firebaseService.database().ref(`users/${uid}`);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists()) {
      const timestamp = Date.now();
      const newUser: UserModel & { createdAt: number; updatedAt: number } = {
        email,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      await userRef.set(newUser);
      console.log("New user created", { uid, newUser });
      return { ...newUser, _key: uid };
    }
    const userData = userSnapshot.val() as UserModel;
    const updatePayload: Partial<UserModel> = {};
    if (email && email !== userData.email) {
      updatePayload.email = email;
    }
    updatePayload.updatedAt = Date.now();
    if (Object.keys(updatePayload).length > 0) {
      await userRef.update(updatePayload);
    }
    return { ...userData, ...updatePayload, _key: uid };
  }
  public async getUser(uid: string): Promise<ClientData | null> {
    const userRef = this.firebaseService.database().ref(`users/${uid}`);
    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists()) {
      return null;
    }
    const userData = userSnapshot.val() as UserModel;
    return { ...userData, _key: uid };
  }
  public async upgradeUserPlan(
    uid: string,
    plan: string,
    durationDays: number = 30
  ): Promise<ClientData> {
    const userRef = this.firebaseService.database().ref(`users/${uid}`);
    const now = Date.now();
    const expiresAt = now + durationDays * 24 * 60 * 60 * 1000;
    const updatePayload: Partial<UserModel> = {
      plan: plan as UserModel["plan"],
      planStartedAt: now,
      planExpiresAt: expiresAt,
      updatedAt: now,
    };
    await userRef.update(updatePayload);
    console.log("User plan upgraded", { uid, plan, expiresAt });
    const user = await this.getUser(uid);
    if (!user) {
      throw new Error(`User not found after upgrade: ${uid}`);
    }
    return user;
  }
  public isSubscriptionActive(user: UserModel): boolean {
    if (!user.plan || user.plan === "free") {
      return false;
    }
    if (!user.planExpiresAt) {
      return false;
    }
    return user.planExpiresAt >= Date.now();
  }
  public async getUserPlanStatus(uid: string): Promise<{
    plan: string;
    isActive: boolean;
    expiresAt?: number;
    daysRemaining?: number;
  }> {
    const user = await this.getUser(uid);
    if (!user) {
      return {
        plan: "free",
        isActive: false,
      };
    }
    const isActive = this.isSubscriptionActive(user);
    const daysRemaining = user.planExpiresAt
      ? Math.floor((user.planExpiresAt - Date.now()) / (24 * 60 * 60 * 1000))
      : undefined;
    return {
      plan: user.plan || "free",
      isActive,
      expiresAt: user.planExpiresAt,
      daysRemaining,
    };
  }
}
