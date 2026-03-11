export interface ChatModel {
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessageAt: number;
  messageCount: number;
  status: "active" | "archived";
}
export interface ChatData extends ChatModel {
  _key: string;
}
