import { injectable } from "inversify";
import { FirebaseService } from "./FirebaseService";
import { MessageModel } from "../models/MessageModel";
@injectable()
export class MessageService {
  constructor(
    private firebaseService: FirebaseService
  ) {}
  public async createUserMessage(
    userId: string,
    content: string,
    chatId?: string
  ): Promise<string> {
    const userMessageRef = this.firebaseService.database().ref("messages").push();
    const userMessage: MessageModel = {
      userId,
      role: "user",
      content,
      createdAt: Date.now(),
      status: "pending"
    };
    if (chatId) {
      userMessage.chatId = chatId;
    }
    await userMessageRef.set(userMessage);
    return userMessageRef.key!;
  }
  public async createAgentMessage(
    chatId: string,
    userId: string,
    content: string,
    status: "pending" | "completed" = "completed"
  ): Promise<string> {
    const agentMessageRef = this.firebaseService.database().ref("messages").push();
    const agentMessage: MessageModel = {
      chatId,
      userId,
      role: "agent",
      content,
      createdAt: Date.now(),
      status
    };
    await agentMessageRef.set(agentMessage);
    return agentMessageRef.key!;
  }
  private getMessageRef(messageId: string) {
    return this.firebaseService.database().ref(`messages/${messageId}`);
  }
  public async updateMessageStatus(
    messageId: string,
    status: "pending" | "completed" | "error",
    error?: string
  ): Promise<void> {
    const messageRef = this.getMessageRef(messageId);
    const updates: Partial<MessageModel> = { status };
    if (error) {
      updates.error = error;
    }
    await messageRef.update(updates);
  }
  public async updateMessageChatId(
    messageId: string,
    chatId: string
  ): Promise<void> {
    const messageRef = this.getMessageRef(messageId);
    await messageRef.update({ chatId });
  }
  public async updateMessageContent(
    messageId: string,
    updates: Partial<MessageModel>
  ): Promise<void> {
    const messageRef = this.getMessageRef(messageId);
    const updateData: Partial<MessageModel> & { updatedAt: number } = {
      ...updates,
      updatedAt: Date.now()
    };
    await messageRef.update(updateData);
  }
}
