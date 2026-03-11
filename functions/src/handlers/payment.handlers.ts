import { onRequest, onCall, HttpsError } from "firebase-functions/v2/https";
import { container } from "../invercify.config";
import { PaymentService } from "../services/PaymentService";
import { HotPayClient } from "../clients/HotPayClient";
import { PlanLimitsService } from "../services/PlanLimitsService";
import { UserService } from "../services/UserService";
import { UsageTrackingService } from "../services/UsageTrackingService";
import { checkAuthAndUser } from "./auth.utils";
export const ITEM_IDS = {
  starter: "2a2434e71bed54f62ca432eb0a3c6b06b2dd08e0ec7d7ed7096db4fec39dca5a",
  pro: ""
};
export const hotPayWebhook = onRequest(
  {
    cors: true,
    region: "us-central1",
  },
  async (request, response) => {
    const contentType = request.headers["content-type"] || "";
    const isJson = contentType.includes("application/json");
    const isFormData = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");
    console.log("=== Webhook Request Received ===", {
      method: request.method,
      path: request.path,
      url: request.url,
      contentType,
      isJson,
      isFormData,
      headers: {
        "content-type": request.headers["content-type"],
        "user-agent": request.headers["user-agent"],
        "x-forwarded-for": request.headers["x-forwarded-for"],
      },
    });
    if (request.method !== "POST") {
      console.log("Method not allowed", { method: request.method });
      response.status(405).json({ error: "Method not allowed" });
      return;
    }
    let webhookData: any;
    try {
      if (isJson) {
        webhookData = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
      } else if (isFormData) {
        webhookData = request.body;
      } else {
        webhookData = request.body;
      }
      console.log("Webhook data parsed", {
        rawBodyType: typeof request.body,
        parsedData: webhookData,
        keys: webhookData ? Object.keys(webhookData) : [],
      });
      if (!webhookData || (typeof webhookData === "object" && Object.keys(webhookData).length === 0)) {
        console.warn("Empty or invalid webhook data received");
        response.status(400).json({ error: "Invalid webhook data" });
        return;
      }
      const paymentService = container.get(PaymentService);
      await paymentService.processPayment(webhookData);
      console.log("Webhook processed successfully", {
        memo: webhookData.memo || webhookData.userId,
        status: webhookData.status,
        item_id: webhookData.item_id,
      });
      response.status(200).json({ success: true });
    } catch (error) {
      console.error("=== Webhook Processing Error ===", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        webhookData: webhookData || "not parsed",
      });
      response.status(500).json({
        error: "Payment processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
export const initiatePayment = onCall<{ planId: "starter" | "pro"; periodMonths?: 3 | 6 | 12 }, Promise<{ paymentUrl: string }>>(
  async (request) => {
    const uid = await checkAuthAndUser(request);
    const { planId, periodMonths = 3 } = request.data;
    if (!planId || (planId !== "starter" && planId !== "pro")) {
      throw new HttpsError("invalid-argument", "Invalid plan ID. Must be 'starter' or 'pro'");
    }
    if (periodMonths !== 3 && periodMonths !== 6 && periodMonths !== 12) {
      throw new HttpsError("invalid-argument", "Invalid period. Must be 3, 6, or 12 months");
    }
    const itemId = ITEM_IDS[planId];
    if (!itemId) {
      throw new HttpsError("failed-precondition", `Payment not configured for ${planId} plan`);
    }
    const planLimitsService = container.get(PlanLimitsService);
    const amount = planLimitsService.calculatePriceWithDiscount(planId, periodMonths);
    const hotPayClient = container.get(HotPayClient);
    const memo = `${uid}:${planId}:${periodMonths}`;
    const paymentUrl = hotPayClient.generatePaymentUrl(itemId, memo, amount);
    console.log("Payment initiated", { uid, planId, periodMonths, amount, paymentUrl });
    return { paymentUrl };
  }
);
export const verifyPaymentByMemo = onCall<{ memo: string; itemId?: string }, Promise<{
  found: boolean;
  processed: boolean;
  paymentKey?: string;
  planId?: string;
}>>(
  async (request) => {
    const uid = await checkAuthAndUser(request);
    const { memo, itemId } = request.data;
    if (!memo) {
      throw new HttpsError("invalid-argument", "Memo parameter is required");
    }
    if (memo !== uid) {
      throw new HttpsError("permission-denied", "Memo must match authenticated user ID");
    }
    const paymentService = container.get(PaymentService);
    const result = await paymentService.verifyAndProcessPaymentByMemo(memo, itemId);
    return result;
  }
);
export const checkSubscriptionStatus = onCall<void, Promise<{
  isActive: boolean;
  plan: string;
  expiresAt?: number;
  daysRemaining?: number;
  limits: {
    computeHoursPerMonth: number;
    requestsPerDay: number;
  };
  usage: {
    computeHoursUsed: number;
    requestsCount: number;
  };
  hasQuota: boolean;
}>>(
  async (request) => {
    const uid = await checkAuthAndUser(request);
    const userService = container.get(UserService);
    const planLimitsService = container.get(PlanLimitsService);
    const usageTrackingService = container.get(UsageTrackingService);
    const user = await userService.getUser(uid);
    if (!user) {
      throw new HttpsError("not-found", "User not found");
    }
    const isActive = userService.isSubscriptionActive(user);
    const effectivePlan = await planLimitsService.getActivePlan(uid);
    const limits = planLimitsService.getPlanLimits(effectivePlan);
    const remainingSeconds = await planLimitsService.getRemainingComputeSeconds(uid);
    const hasQuota = remainingSeconds > 0;
    const usage = await usageTrackingService.getUsageForMonth(uid);
    const computeSecondsUsed = usage?.computeSecondsUsed || 0;
    const daysRemaining = user.planExpiresAt
      ? Math.floor((user.planExpiresAt - Date.now()) / (24 * 60 * 60 * 1000))
      : undefined;
    return {
      isActive,
      plan: effectivePlan,
      expiresAt: user.planExpiresAt,
      daysRemaining,
      limits: {
        computeHoursPerMonth: Math.round((limits.computeSecondsPerMonth / 3600) * 10) / 10,
        requestsPerDay: limits.requestsPerDay,
      },
      usage: {
        computeHoursUsed: Math.round((computeSecondsUsed / 3600) * 10) / 10,
        requestsCount: usage?.requestsCount || 0,
      },
      hasQuota,
    };
  }
);
