import type { CollapsibleSection, MessageMetadata } from "./collapsible-section.js";
import type { MessageStatus } from "./enums.js";
export { MessageStatus } from "./enums.js";
export interface Message {
  id?: string;
  chatId?: string;
  userId: string;
  role: "user" | "agent";
  content: string;
  sections?: CollapsibleSection[];
  createdAt: number;
  updatedAt?: number;
  status: MessageStatus;
  error?: string;
  metadata?: MessageMetadata;
}
export interface Chat {
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  messageCount: number;
  status: "active" | "archived";
}
