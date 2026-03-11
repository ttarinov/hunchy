import { FieldValue } from "firebase-admin/firestore";
import { UserModel, UsageModel, PLAN_LIMITS } from "../models";
import { FirebaseService } from "../services/FirebaseService";

export class UsageTracker {
  constructor(
    private firebaseService: FirebaseService
  ) {}
  async checkQuota(userId: string): Promise<{
    allowed: boolean;
    remainingSeconds: number;
    limitSeconds: number;
  }> {
    const userDoc = await this.firebaseService.database().ref(`users/${userId}`).get();
    const user = userDoc.val() as UserModel;
    if (!user) {
      throw new Error("User not found");
    }
    const plan = user.plan || "free";
    const limits = PLAN_LIMITS[plan];
    const now = Date.now();
    const periodEnd = user.billingPeriodEnd || 0;
    let computeUsed = user.computeSecondsUsed || 0;
    if (now > periodEnd) {
      computeUsed = 0;
      await this.firebaseService.database().ref(`users/${userId}`).update({
        computeSecondsUsed: 0,
        billingPeriodStart: now,
        billingPeriodEnd: now + 30 * 24 * 60 * 60 * 1000, 
      });
    }
    const remaining = limits.tokensPerDay - computeUsed;
    return {
      allowed: remaining > 0,
      remainingSeconds: Math.max(0, remaining),
      limitSeconds: limits.tokensPerDay,
    };
  }
  async trackUsage(
    userId: string,
    flowType: UsageModel["flowType"],
    computeSeconds: number,
    requestId: string
  ): Promise<void> {
    const usageRef = this.firebaseService.database().ref(`usage/${userId}/${requestId}`);
    await usageRef.set({
      userId,
      flowType,
      computeSeconds,
      requestId,
      createdAt: Date.now(),
    } as UsageModel);
    const userRef = this.firebaseService.database().ref(`users/${userId}`);
    await userRef.update({
      computeSecondsUsed: FieldValue.increment(computeSeconds),
      requestsCount: FieldValue.increment(1),
      lastUpdated: Date.now(),
    });
  }
  async getUsageStats(userId: string): Promise<{
    computeUsed: number;
    computeLimit: number;
    percentUsed: number;
    requestsThisMonth: number;
    plan: string;
  }> {
    const userDoc = await this.firebaseService.database().ref(`users/${userId}`).get();
    const user = userDoc.val() as UserModel;
    const plan = user.plan || "free";
    const limits = PLAN_LIMITS[plan];
    const computeUsed = user.computeSecondsUsed || 0;
    const percentUsed = (computeUsed / limits.tokensPerDay) * 100;
    return {
      computeUsed,
      computeLimit: limits.tokensPerDay,
      percentUsed: Math.round(percentUsed),
      requestsThisMonth: user.requestsThisMonth || 0,
      plan,
    };
  }
}
