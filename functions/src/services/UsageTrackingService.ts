import { injectable } from "inversify";
import { FirebaseService } from "./FirebaseService";
import { UsageModel } from "../models";
export interface UsageRecord {
  userId: string;
  day: string; 
  tokensUsed: number;
  requestsCount: number;
  lastUpdated: number;
}
@injectable()
export class UsageTrackingService {
  constructor(
    private firebaseService: FirebaseService
  ) {}
  async trackUsage(
    userId: string,
    flowType: UsageModel["flowType"],
    tokensUsed: number,
    requestId: string
  ): Promise<void> {
    const day = this.getCurrentDay();
    const usageRef = this.firebaseService
      .database()
      .ref(`usage_records/${userId}/${requestId}`);
    await usageRef.set({
      userId,
      flowType,
      tokensUsed,
      requestId,
      createdAt: Date.now()
    });
    const dailyRef = this.firebaseService
      .database()
      .ref(`usage/${userId}/${day}`);
    await dailyRef.transaction((current) => {
      return {
        userId,
        day,
        tokensUsed: (current?.tokensUsed || 0) + tokensUsed,
        requestsCount: (current?.requestsCount || 0) + 1,
        lastUpdated: Date.now()
      };
    });
  }
  async getUsageForDay(userId: string, day?: string): Promise<UsageRecord | null> {
    const targetDay = day || this.getCurrentDay();
    const usageRef = this.firebaseService
      .database()
      .ref(`usage/${userId}/${targetDay}`);
    const snapshot = await usageRef.get();
    if (!snapshot.exists()) {
      return null;
    }
    return snapshot.val() as UsageRecord;
  }
  async getUsageHistory(userId: string, days: number = 30): Promise<UsageRecord[]> {
    const usageRef = this.firebaseService
      .database()
      .ref(`usage/${userId}`);
    const snapshot = await usageRef
      .orderByKey()
      .limitToLast(days)
      .get();
    if (!snapshot.exists()) {
      return [];
    }
    const data = snapshot.val();
    return Object.values(data) as UsageRecord[];
  }
  getCurrentDay(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }
  getCurrentMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  async recordTokenUsage(userId: string, inputTokens: number, outputTokens: number): Promise<void> {
    const totalTokens = inputTokens + outputTokens;
    const requestId = `token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await this.trackUsage(userId, "commit", totalTokens, requestId);
  }
}
