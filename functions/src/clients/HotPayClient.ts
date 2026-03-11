import { injectable } from "inversify";
import * as functions from "firebase-functions";
export interface ProcessedPayment {
  memo: string;
  item_id: string;
  timestamp: number;
  amount: string;
  token_id: string;
  sender_id: string;
  near_trx: string;
  status: string;
}
export interface ProcessedPaymentsResponse {
  payments: ProcessedPayment[];
  pagination: {
    limit: number;
    offset: number;
    count: number;
  };
}
@injectable()
export class HotPayClient {
  private apiBaseUrl: string;
  private apiToken: string;
  private paymentBaseUrl: string;
  private websiteUrl: string;
  constructor() {
    const config = functions.config();
    this.apiBaseUrl = config.hotpay?.api_base_url || "https://api.hot-labs.org";
    this.apiToken = config.hotpay?.partner_api_token || "";
    this.paymentBaseUrl = config.hotpay?.payment_base_url || "https://pay.hot-labs.org";
    this.websiteUrl = process.env.WEBSITE_URL || config.hotpay?.website_url || "http://localhost:3000";
    if (!this.apiToken) {
      console.warn("Hot Pay API token not configured");
    }
  }
  async verifyPaymentByTransactionId(memo: string, transactionId: string): Promise<ProcessedPayment | null> {
    try {
      const payments = await this.getProcessedPayments({ memo });
      const matchingPayment = payments.find(
        (p: ProcessedPayment) => p.near_trx === transactionId && p.status === "SUCCESS"
      );
      return matchingPayment || null;
    } catch (error) {
      console.error("Error verifying payment:", error);
      throw error;
    }
  }
  async getProcessedPayments(filters: {
    memo?: string;
    item_id?: string;
    sender_id?: string;
  }): Promise<ProcessedPayment[]> {
    if (!this.apiToken) {
      throw new Error("Hot Pay API token not configured");
    }
    const queryParams = new URLSearchParams();
    if (filters.memo) queryParams.append("memo", filters.memo);
    if (filters.item_id) queryParams.append("item_id", filters.item_id);
    if (filters.sender_id) queryParams.append("sender_id", filters.sender_id);
    queryParams.append("limit", "100");
    const url = `${this.apiBaseUrl}/partners/processed_payments?${queryParams.toString()}`;
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          Accept: "application/json",
        },
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Hot Pay API error: ${response.status} - ${errorText}`);
      }
      const data: ProcessedPaymentsResponse = await response.json();
      return data.payments || [];
    } catch (error) {
      console.error("Error fetching processed payments:", error);
      throw error;
    }
  }
  generatePaymentUrl(itemId: string, userId: string, amount: number): string {
    const url = new URL(`${this.paymentBaseUrl}/payment`);
    url.searchParams.append("item_id", itemId);
    url.searchParams.append("memo", userId);
    url.searchParams.append("amount", amount.toString());
    const isLocalhost = this.websiteUrl.includes("localhost") || this.websiteUrl.includes("127.0.0.1");
    if (!isLocalhost) {
      const redirectUrl = `${this.websiteUrl}/dashboard/payment-success`;
      url.searchParams.append("redirect_url", redirectUrl);
    }
    return url.toString();
  }
}
