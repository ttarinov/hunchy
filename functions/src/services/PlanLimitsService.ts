import { injectable } from "inversify";
import { UsageTrackingService } from "./UsageTrackingService";
import { UserService } from "./UserService";
import { PLAN_LIMITS } from "../models";
export interface PlanLimits {
  tokensPerDay: number;
  requestsPerDay: number;
  maxFilesPerRefactor: number;
}
@injectable()
export class PlanLimitsService {
  constructor(
    private usageTrackingService: UsageTrackingService,
    private userService: UserService
  ) {}
  getPlanLimits(plan: string): PlanLimits {
    return PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free;
  }
  async getActivePlan(userId: string): Promise<string> {
    const user = await this.userService.getUser(userId);
    if (!user) return 'free';
    const plan = user.plan || 'free';
    if (user.planExpiresAt && user.planExpiresAt < Date.now()) {
      return 'free'; 
    }
    return plan;
  }
  async checkTokenLimit(userId: string, estimatedTokens: number): Promise<boolean> {
    const plan = await this.getActivePlan(userId);
    const limits = this.getPlanLimits(plan);
    if (limits.tokensPerDay === Infinity) return true;
    const usage = await this.usageTrackingService.getUsageForDay(userId);
    const currentUsage = usage?.tokensUsed || 0;
    return (currentUsage + estimatedTokens) <= limits.tokensPerDay;
  }
  async getRemainingTokens(userId: string): Promise<number> {
    const plan = await this.getActivePlan(userId);
    const limits = this.getPlanLimits(plan);
    if (limits.tokensPerDay === Infinity) return Infinity;
    const usage = await this.usageTrackingService.getUsageForDay(userId);
    const currentUsage = usage?.tokensUsed || 0;
    return Math.max(0, limits.tokensPerDay - currentUsage);
  }
  async checkComputeLimit(userId: string, estimatedSeconds: number): Promise<boolean> {
    const estimatedTokens = estimatedSeconds * 100;
    return this.checkTokenLimit(userId, estimatedTokens);
  }
  async getRemainingComputeSeconds(userId: string): Promise<number> {
    const remainingTokens = await this.getRemainingTokens(userId);
    if (remainingTokens === Infinity) return Infinity;
    return remainingTokens / 100;
  }
  calculatePriceWithDiscount(plan: string, periodMonths: 3 | 6 | 12): number {
    const basePrices = { free: 0, starter: 12, pro: 29, enterprise: 99 };
    const basePrice = basePrices[plan as keyof typeof basePrices] || 0;
    const originalTotal = basePrice * periodMonths;
    let discount = 0;
    if (periodMonths === 6) discount = 0.05;
    else if (periodMonths === 12) discount = 0.10;
    return originalTotal * (1 - discount);
  }
  getDurationDays(periodMonths: 3 | 6 | 12): number {
    return periodMonths * 30;
  }
}
