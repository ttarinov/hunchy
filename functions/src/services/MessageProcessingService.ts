import { injectable } from "inversify";
import { ChatService } from "./ChatService";
import { AICommitService } from "./AICommitService";
import { UserService } from "./UserService";
import { MessageModel } from "../models/MessageModel";
import type { Reference } from "firebase-admin/database";
@injectable()
export class MessageProcessingService {
  constructor(
    private chatService: ChatService,
    private aiCommitService: AICommitService,
    private userService: UserService
  ) {}
  public async processUserMessage(
    messageId: string,
    message: MessageModel,
    messageRef: Reference
  ): Promise<void> {
    const { chatId, userId, content } = message;
    if (!userId) {
      console.error("Message missing userId", { messageId });
      await messageRef.update({
        status: "error",
        error: "Message must have userId"
      });
      return;
    }
    try {
      await this.userService.getOrCreateUser(userId, ""); 
    } catch (error) {
      console.error("Error ensuring user exists when processing message", { messageId, userId, error });
      await messageRef.update({
        status: "error",
        error: "Failed to ensure user exists. Please contact support."
      });
      return;
    }
    if (!chatId) {
      console.error("Message missing chatId", { messageId, userId });
      await messageRef.update({
        status: "error",
        error: "Message must have chatId. Use createChatWithMessage function to create chat with message."
      });
      return;
    }
    const finalChatId = chatId;
    await messageRef.update({ status: "completed" });
    console.log("User message marked as completed", { messageId });
    if (this.aiCommitService.isVerificationRequest(content)) {
      await this.aiCommitService.processVerificationRequest(messageId, finalChatId, userId);
    } else {
      await this.aiCommitService.processCommitRequest(messageId, finalChatId, userId, content);
    }
    const chat = await this.chatService.getChat(finalChatId);
    const messageCount = (chat?.messageCount || 0) + 2;
    await this.chatService.updateChatMetadata(finalChatId, {
      lastMessageAt: Date.now(),
      messageCount
    });
    console.log("Message processing completed", { messageId, chatId: finalChatId });
  }
}
