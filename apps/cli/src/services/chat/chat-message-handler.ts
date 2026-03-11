import chalk from "chalk";
import { ChatInitializer, type ChatState } from "./chat-initializer.js";
import { ApiClient } from "../../auth/api-client.js";
import { callFunction } from "../../utils/functions-client.js";
import { getErrorMessage } from "../../utils/error-utils.js";
import { createUserMessage } from "../../utils/firebase-helpers.js";
import { AuthTokenService } from "../auth-token-service.js";
export class ChatMessageHandler {
  private chatInitializer: ChatInitializer;
  private state: ChatState | null = null;
  constructor(chatInitializer: ChatInitializer) {
    this.chatInitializer = chatInitializer;
  }
  async handleMessage(
    message: string,
    chatId: string | null,
    onMessageSent: (messageId: string, chatId: string | null) => void
  ): Promise<void> {
    try {
      const apiClient = new ApiClient();
      const isAuthenticated = await apiClient.isAuthenticated();
      if (!isAuthenticated) {
        throw new Error("Not authenticated. Please authenticate first with /auth or hunchy auth");
      }
      if (!this.chatInitializer.isInitialized()) {
        try {
          this.state = await this.chatInitializer.initialize();
        } catch (error) {
          const errorMessage = getErrorMessage(error);
          throw new Error(`Chat not available: ${errorMessage}. Please authenticate first with /auth or hunchy auth`);
        }
      } else {
        this.state = this.chatInitializer.getState();
      }
      if (!this.state.database || !this.state.userId || !this.state.messagesPath) {
        const details = [
          `Database: ${this.state.database ? "✓" : "✗"}`,
          `UserId: ${this.state.userId ? "✓" : "✗"}`,
          `MessagesPath: ${this.state.messagesPath ? "✓" : "✗"}`
        ].join(", ");
        throw new Error(`Chat not available (${details}). Please authenticate first with /auth or hunchy auth`);
      }
      let finalChatId = chatId;
      let messageId: string;
      if (!chatId) {
        const authTokenService = new AuthTokenService(apiClient);
        const idToken = await authTokenService.getAuthTokenOrThrow();
        const result = await callFunction<{ chatId: string; messageId: string }>(
          "createChatWithMessage",
          { content: message },
          idToken
        );
        finalChatId = result.chatId;
        messageId = result.messageId;
      } else {
        messageId = await createUserMessage(
          this.state.database!,
          this.state.messagesPath!,
          this.state.userId!,
          message,
          chatId
        );
      }
      onMessageSent(messageId, finalChatId);
    } catch (error) {
      throw error;
    }
  }
  getState(): ChatState | null {
    return this.state || this.chatInitializer.getState();
  }
}
