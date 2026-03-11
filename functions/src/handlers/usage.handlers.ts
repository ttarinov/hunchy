import { onCall, HttpsError } from "firebase-functions/v2/https";
import { container } from "../invercify.config";
import { UsageTrackingService } from "../services/UsageTrackingService";
import { PlanLimitsService } from "../services/PlanLimitsService";
import { UserService } from "../services/UserService";
import { checkAuthAndUser } from "./auth.utils";
export const trackUsage = onCall<{
  flowType: "commit" | "analyze" | "refactor" | "pre-commit";
  tokensUsed?: number;
  computeSeconds?: number; 
  requestId: string;
}, Promise<{ success: boolean; remainingTokens: number }>>(
  async (request) => {
    const uid = await checkAuthAndUser(request);
    const { flowType, tokensUsed, computeSeconds, requestId } = request.data;
    const tokens = tokensUsed ?? (computeSeconds ? computeSeconds * 100 : 1000);
    const planLimitsService = container.get(PlanLimitsService);
    const canExecute = await planLimitsService.checkTokenLimit(uid, tokens);
    if (!canExecute) {
      const remaining = await planLimitsService.getRemainingTokens(uid);
      throw new HttpsError(
        "resource-exhausted",
        `Token quota exceeded. ${remaining.toLocaleString()} tokens remaining today.`
      );
    }
    const usageTrackingService = container.get(UsageTrackingService);
    await usageTrackingService.trackUsage(uid, flowType, tokens, requestId);
    const remainingTokens = await planLimitsService.getRemainingTokens(uid);
    console.log("Usage tracked", { userId: uid, flowType, tokensUsed: tokens, requestId });
    return { success: true, remainingTokens };
  }
);
export const getUsageData = onCall<void, Promise<{
  tokensUsed: number;
  tokensLimit: number;
  requestsCount: number;
  day: string;
  plan: string;
  isSubscriptionActive: boolean;
  planExpiresAt?: number;
  daysRemaining?: number;
  resetsAt: number; 
}>>(
  async (request) => {
    const uid = await checkAuthAndUser(request);
    const usageTrackingService = container.get(UsageTrackingService);
    const userService = container.get(UserService);
    const planLimitsService = container.get(PlanLimitsService);
    const usage = await usageTrackingService.getUsageForDay(uid);
    const user = await userService.getUser(uid);
    const effectivePlan = await planLimitsService.getActivePlan(uid);
    const limits = planLimitsService.getPlanLimits(effectivePlan);
    const isActive = user ? userService.isSubscriptionActive(user) : false;
    const daysRemaining = user?.planExpiresAt
      ? Math.floor((user.planExpiresAt - Date.now()) / (24 * 60 * 60 * 1000))
      : undefined;
    const tokensUsed = usage?.tokensUsed || 0;
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    const resetsAt = tomorrow.getTime();
    return {
      tokensUsed,
      tokensLimit: limits.tokensPerDay,
      requestsCount: usage?.requestsCount || 0,
      day: usage?.day || usageTrackingService.getCurrentDay(),
      plan: effectivePlan,
      isSubscriptionActive: isActive,
      planExpiresAt: user?.planExpiresAt,
      daysRemaining,
      resetsAt
    };
  }
);
export const getUsageHistory = onCall<{ days?: number }, Promise<Array<{
  day: string;
  tokensUsed: number;
  requestsCount: number;
}>>>(
  async (request) => {
    const uid = await checkAuthAndUser(request);
    const usageTrackingService = container.get(UsageTrackingService);
    const days = request.data?.days || 30;
    const history = await usageTrackingService.getUsageHistory(uid, days);
    return history
      .sort((a, b) => a.day.localeCompare(b.day))
      .map(record => ({
        day: record.day,
        tokensUsed: record.tokensUsed,
        requestsCount: record.requestsCount
      }));
  }
);
