import { injectable } from "inversify";
import { HotPayClient } from "../clients/HotPayClient";
import { UserService } from "./UserService";
import { FirebaseService } from "./FirebaseService";
import { PlanLimitsService } from "./PlanLimitsService";
import { PaymentModel } from "../models/PaymentModel";
import { ITEM_IDS } from "../handlers/payment.handlers";
import { container } from "../invercify.config";
@injectable()
export class PaymentService {
  constructor(
    private hotPayClient: HotPayClient,
    private userService: UserService,
    private firebaseService: FirebaseService
  ) {}
  getPlanByItemId(itemId: string): "starter" | "pro" | null {
    if (itemId === ITEM_IDS.starter) return "starter";
    if (itemId === ITEM_IDS.pro && ITEM_IDS.pro) return "pro";
    return null;
  }
  getPlanByAmount(amount: number): "starter" | "pro" | null {
    if (amount === 0.0001 || amount === 0.001 || amount === 5) return "starter";
    if (amount === 10) return "pro";
    return null;
  }
  async checkPaymentProcessed(paymentKey: string): Promise<boolean> {
    const paymentRef = this.firebaseService.database().ref(`payments/${paymentKey}`);
    const snapshot = await paymentRef.get();
    if (!snapshot.exists()) {
      return false;
    }
    const payment = snapshot.val() as PaymentModel;
    return payment.processed === true;
  }
  async getPaymentByKey(
    paymentKey: string,
    itemId?: string,
    memo?: string
  ): Promise<PaymentModel | null> {
    const paymentRef = this.firebaseService.database().ref(`payments/${paymentKey}`);
    const snapshot = await paymentRef.get();
    if (snapshot.exists()) {
      return snapshot.val() as PaymentModel;
    }
    if (itemId && memo) {
      const paymentsRef = this.firebaseService.database().ref("payments");
      const allPaymentsSnapshot = await paymentsRef.get();
      if (allPaymentsSnapshot.exists()) {
        const payments = allPaymentsSnapshot.val() as Record<string, PaymentModel>;
        const matchingPayment = Object.values(payments).find(
          (p) => p.itemId === itemId && p.memo === memo && !p.processed
        );
        if (matchingPayment) {
          return matchingPayment;
        }
      }
    }
    return null;
  }
  async storePaymentRecord(paymentData: Partial<PaymentModel>): Promise<void> {
    if (!paymentData.hotPayTrxId) {
      throw new Error("hotPayTrxId is required to store payment record");
    }
    const paymentRef = this.firebaseService.database().ref(`payments/${paymentData.hotPayTrxId}`);
    await paymentRef.set({
      ...paymentData,
      createdAt: paymentData.createdAt || Date.now(),
    });
  }
  async updatePaymentRecord(
    paymentKey: string,
    updates: Partial<PaymentModel>
  ): Promise<void> {
    const paymentRef = this.firebaseService.database().ref(`payments/${paymentKey}`);
    await paymentRef.update(updates);
  }
  async migratePaymentKey(tempKey: string, newKey: string): Promise<void> {
    const tempRef = this.firebaseService.database().ref(`payments/${tempKey}`);
    const tempSnapshot = await tempRef.get();
    if (!tempSnapshot.exists()) {
      console.log("No payment found at temp key, skipping migration", { tempKey });
      return;
    }
    const payment = tempSnapshot.val() as PaymentModel;
    const newRef = this.firebaseService.database().ref(`payments/${newKey}`);
    await newRef.set({
      ...payment,
      hotPayTrxId: newKey,
      updatedAt: Date.now(),
    });
    await tempRef.remove();
    console.log("Payment migrated", { tempKey, newKey });
  }
  async markPaymentProcessed(paymentKey: string): Promise<void> {
    const paymentRef = this.firebaseService.database().ref(`payments/${paymentKey}`);
    await paymentRef.update({
      processed: true,
      processedAt: Date.now(),
    });
  }
  async verifyAndProcessPaymentByMemo(memo: string, itemId?: string): Promise<{
    found: boolean;
    processed: boolean;
    paymentKey?: string;
    planId?: string;
  }> {
    console.log("Verifying payment by memo", { memo, itemId });
    try {
      const payments = await this.hotPayClient.getProcessedPayments({ 
        memo,
        ...(itemId && { item_id: itemId })
      });
      const successfulPayments = payments.filter(
        (p) => p.status === "SUCCESS" || p.status === "COMPLETED" || p.status === "PAID"
      );
      if (successfulPayments.length === 0) {
        console.log("No successful payments found for memo", { memo });
        return { found: false, processed: false };
      }
      for (const payment of successfulPayments) {
        const paymentKey = payment.near_trx || `${payment.item_id}_${payment.memo}_${Math.floor(payment.timestamp / 60000)}`;
        const alreadyProcessed = await this.checkPaymentProcessed(paymentKey);
        if (alreadyProcessed) {
          console.log("Payment already processed", { paymentKey, memo });
          return { 
            found: true, 
            processed: true, 
            paymentKey,
            planId: this.getPlanByAmount(parseFloat(payment.amount)) || undefined
          };
        }
        const planId = this.getPlanByAmount(parseFloat(payment.amount));
        if (!planId) {
          console.warn("Could not determine plan from amount", { amount: payment.amount, memo });
          continue;
        }
        console.log("Processing payment found via memo", {
          paymentKey,
          memo,
          planId,
          amount: payment.amount,
          near_trx: payment.near_trx,
        });
        const webhookData = {
          status: payment.status,
          memo: payment.memo,
          item_id: payment.item_id,
          near_trx: payment.near_trx,
          amount: payment.amount,
          token_id: payment.token_id,
          transaction_id: payment.near_trx,
        };
        await this.processPayment(webhookData);
        return {
          found: true,
          processed: true,
          paymentKey,
          planId,
        };
      }
      console.log("Found payments but none were processable", { memo, successfulPayments });
      return { found: true, processed: false };
    } catch (error) {
      console.error("Error verifying payment by memo:", error);
      throw error;
    }
  }
  async processPayment(webhookData: any): Promise<void> {
    console.log("PaymentService.processPayment called", { webhookData });
    try {
      const status = webhookData.status?.toUpperCase();
      const memo = webhookData.memo || webhookData.userId;
      const itemId = webhookData.item_id;
      let hotPayTrxId = webhookData.near_trx || webhookData.transaction_id;
      if (!memo || !itemId) {
        throw new Error(`Missing required payment data: memo=${memo}, itemId=${itemId}`);
      }
      const amount = parseFloat(webhookData.amount || "0");
      const paymentStatus: "pending" | "completed" | "failed" =
        status === "SUCCESS" || status === "COMPLETED" || status === "PAID"
          ? "completed"
          : status === "FAILED" || status === "CANCELLED"
          ? "failed"
          : "pending";
      let planId: "starter" | "pro" | null = null;
      const planIdFromItem = this.getPlanByItemId(itemId);
      const planIdFromAmount = this.getPlanByAmount(amount);
      if (planIdFromItem) {
        planId = planIdFromItem;
        console.log("Plan determined from item_id", { itemId, planId });
      } else if (planIdFromAmount) {
        planId = planIdFromAmount;
        console.log("Plan determined from amount (fallback)", { amount, planId });
      } else {
        console.warn("Could not determine plan from item_id or amount", {
          itemId,
          amount,
          planIdFromItem,
          planIdFromAmount,
        });
      }
      console.log("Processing webhook", {
        status,
        paymentStatus,
        memo,
        itemId,
        hotPayTrxId,
        amount,
        planId,
        planIdFromItem,
        planIdFromAmount,
      });
      let paymentKey: string;
      if (hotPayTrxId) {
        paymentKey = hotPayTrxId;
      } else {
        const timestampMinute = Math.floor(Date.now() / 60000);
        paymentKey = `${itemId}_${memo}_${timestampMinute}`;
      }
      const existingPayment = await this.getPaymentByKey(paymentKey, itemId, memo);
      if (existingPayment) {
        console.log("Updating existing payment record", { paymentKey, status });
        const updates: Partial<PaymentModel> = {
          status: paymentStatus,
          amount: amount.toString(),
        };
        if (hotPayTrxId && !existingPayment.hotPayTrxId) {
          updates.hotPayTrxId = hotPayTrxId;
        }
        if (planId) {
          updates.planId = planId;
        }
        await this.updatePaymentRecord(paymentKey, updates);
        if (hotPayTrxId && paymentKey !== hotPayTrxId && !existingPayment.hotPayTrxId) {
          console.log("Migrating payment to near_trx key", {
            tempKey: paymentKey,
            newKey: hotPayTrxId,
          });
          await this.migratePaymentKey(paymentKey, hotPayTrxId);
          paymentKey = hotPayTrxId;
        }
      } else {
        console.log("Creating new payment record", { paymentKey, status });
        const memoParts = memo.split(":");
        const userId = memoParts[0];
        await this.storePaymentRecord({
          hotPayTrxId: paymentKey,
          userId: userId,
          planId: planId || "unknown",
          amount: amount.toString(),
          tokenId: webhookData.token_id || "",
          status: paymentStatus,
          processed: false,
          memo,
          itemId,
        });
      }
      const successStatuses = ["SUCCESS", "COMPLETED", "PAID"];
      if (successStatuses.includes(status) && memo && planId) {
        const finalPaymentKey = hotPayTrxId || paymentKey;
        const alreadyProcessed = await this.checkPaymentProcessed(finalPaymentKey);
        if (!alreadyProcessed) {
          const memoParts = memo.split(":");
          const userId = memoParts[0];
          const periodMonths = memoParts.length >= 3 
            ? parseInt(memoParts[2], 10) as 3 | 6 | 12
            : 3;
          const validPeriod = periodMonths === 3 || periodMonths === 6 || periodMonths === 12;
          const finalPeriodMonths = validPeriod ? periodMonths : 3;
          console.log("Processing plan upgrade", { 
            userId, 
            planId, 
            periodMonths: finalPeriodMonths,
            originalMemo: memo 
          });
          if (hotPayTrxId) {
            try {
              console.log("Verifying payment via Hot Pay API", { memo, hotPayTrxId });
              const verifiedPayment = await this.hotPayClient.verifyPaymentByTransactionId(
                memo,
                hotPayTrxId
              );
              if (!verifiedPayment) {
                console.warn("Payment verification failed, but proceeding", {
                  hotPayTrxId,
                });
              } else {
                console.log("Payment verified", { verifiedPayment });
              }
            } catch (verifyError) {
              console.error("Error verifying payment, but proceeding", verifyError);
            }
          }
          const planLimitsService = container.get<PlanLimitsService>(PlanLimitsService);
          const durationDays = planLimitsService.getDurationDays(finalPeriodMonths);
          console.log("Upgrading user plan", { 
            userId, 
            planId, 
            periodMonths: finalPeriodMonths,
            durationDays 
          });
          await this.userService.upgradeUserPlan(userId, planId, durationDays);
          console.log("User plan upgraded successfully", { userId, planId, durationDays });
          await this.markPaymentProcessed(finalPaymentKey);
        } else {
          console.log("Payment already processed, skipping plan upgrade", {
            paymentKey: finalPaymentKey,
          });
        }
      } else {
        console.log("Payment not yet completed or planId unknown, skipping plan upgrade", {
          status,
          planId,
        });
      }
      console.log("Payment processed successfully", {
        paymentKey,
        userId: memo,
        planId,
        amount,
        status: paymentStatus,
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      if (webhookData.item_id && (webhookData.memo || webhookData.userId)) {
        try {
          const failedKey =
            webhookData.near_trx ||
            `${webhookData.item_id}_${webhookData.memo || webhookData.userId}_${Math.floor(Date.now() / 60000)}`;
          await this.storePaymentRecord({
            hotPayTrxId: failedKey,
            userId: webhookData.memo || webhookData.userId || "unknown",
            planId: this.getPlanByAmount(parseFloat(webhookData.amount || "0")) || "unknown",
            amount: webhookData.amount || "0",
            tokenId: webhookData.token_id || "",
            status: "failed",
            processed: false,
            memo: webhookData.memo || "",
            itemId: webhookData.item_id || "",
          });
        } catch (storeError) {
          console.error("Error storing failed payment:", storeError);
        }
      }
      throw error;
    }
  }
}
