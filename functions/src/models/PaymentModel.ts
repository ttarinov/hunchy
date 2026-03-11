import "reflect-metadata";
import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional } from "class-validator";
export class PaymentModel {
  @IsString()
  @IsNotEmpty({ message: "Transaction ID is required" })
  hotPayTrxId!: string; 
  @IsString()
  @IsNotEmpty({ message: "User ID is required" })
  userId!: string; 
  @IsString()
  @IsNotEmpty({ message: "Plan ID is required" })
  planId!: string; 
  @IsString()
  @IsNotEmpty({ message: "Amount is required" })
  amount!: string; 
  @IsString()
  @IsNotEmpty({ message: "Token ID is required" })
  tokenId!: string; 
  @IsString()
  @IsNotEmpty({ message: "Status is required" })
  status!: "pending" | "completed" | "failed";
  @IsBoolean()
  processed!: boolean; 
  @IsNumber()
  @IsOptional()
  processedAt?: number; 
  @IsNumber()
  createdAt!: number; 
  @IsString()
  @IsNotEmpty({ message: "Memo is required" })
  memo!: string; 
  @IsString()
  @IsNotEmpty({ message: "Item ID is required" })
  itemId!: string; 
}
