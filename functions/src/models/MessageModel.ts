import { CollapsibleSection, MessageMetadata } from "./CollapsibleSectionModel.js";
export interface MessageModel {
  chatId?: string;
  userId: string;
  role: "user" | "agent";
  content: string;
  sections?: CollapsibleSection[];  
  createdAt: number;
  updatedAt?: number;               
  status: "pending" | "completed" | "error";
  error?: string;
  metadata?: MessageMetadata;       
}
export interface MessageData extends MessageModel {
  _key: string;
}
