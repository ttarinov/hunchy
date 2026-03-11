import "reflect-metadata";
import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from "class-validator";
export enum SystemUserRole {
  ADMIN = "admin",
}
export class SystemUserModel {
  @IsString()
  @IsEmail()
  email!: string;
  @IsString()
  @IsOptional()
  name?: string;
  @IsEnum(SystemUserRole)
  role!: SystemUserRole;
  @IsNumber()
  @IsOptional()
  lastActiveTime?: number;
  @IsNumber()
  createdAt!: number;
  @IsNumber()
  updatedAt!: number;
}
export interface SystemUserData extends SystemUserModel {
  _key: string;
}
export class SystemUserCreateRequest {
  @IsString()
  @IsEmail()
  email!: string;
  @IsEnum(SystemUserRole)
  role!: SystemUserRole;
  @IsString()
  @IsOptional()
  name?: string;
}
