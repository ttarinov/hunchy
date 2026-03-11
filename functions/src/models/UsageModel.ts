import "reflect-metadata";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
export class UsageModel {
  @IsString()
  @IsNotEmpty({ message: "User ID is required" })
  userId!: string;
  @IsString()
  @IsNotEmpty({ message: "Flow type is required" })
  flowType!: "commit" | "analyze" | "refactor" | "pre-commit";
  @IsNumber()
  computeSeconds!: number; 
  @IsNumber()
  tokensUsed?: number; 
  @IsString()
  model?: string; 
  @IsNumber()
  createdAt!: number;
  @IsString()
  requestId!: string; 
}
export const PLAN_LIMITS = {
  free: {
    tokensPerDay: 50000, 
    requestsPerDay: 50,
    maxFilesPerRefactor: 5,
  },
  starter: {
    tokensPerDay: 500000, 
    requestsPerDay: 500,
    maxFilesPerRefactor: 20,
  },
  pro: {
    tokensPerDay: 2000000, 
    requestsPerDay: 5000,
    maxFilesPerRefactor: 100,
  },
  enterprise: {
    tokensPerDay: Infinity, 
    requestsPerDay: Infinity,
    maxFilesPerRefactor: Infinity,
  },
};
