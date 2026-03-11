import "reflect-metadata";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class UserModel {
  @IsString()
  @IsNotEmpty({ message: "Email is required" })
  email!: string;
  @IsNumber()
  createdAt!: number;
  @IsNumber()
  updatedAt!: number;
  plan?: "free" | "starter" | "pro" | "enterprise";
  planStartedAt?: number;
  planExpiresAt?: number;
  @IsNumber()
  computeSecondsUsed?: number; 
  @IsNumber()
  computeSecondsLimit?: number; 
  @IsNumber()
  billingPeriodStart?: number; 
  @IsNumber()
  billingPeriodEnd?: number; 
  @IsNumber()
  requestsThisMonth?: number;
  @IsNumber()
  lastRequestAt?: number;
}
export interface UserData {
  user: UserModel;
}
export interface ClientData extends UserModel {
  _key: string;
}
