import { onCall, HttpsError } from "firebase-functions/v2/https";
import { onValueCreated } from "firebase-functions/v2/database";
import { container } from "../invercify.config";
import { MessageProcessingService } from "../services/MessageProcessingService";
import { ChatService } from "../services/ChatService";
import { MessageService } from "../services/MessageService";
import { MessageModel } from "../models/MessageModel";
import { checkAuthAndUser } from "./auth.utils";
export const createChatWithMessage = onCall<{ content: string }, Promise<{ chatId: string; messageId: string }>>(
  async (request) => {
    const uid = await checkAuthAndUser(request);
    console.log('[createChatWithMessage] Auth info:', {
      uid: request.auth?.uid,
      email: request.auth?.token?.email,
      userId: uid,
      authToken: request.auth?.token ? Object.keys(request.auth.token) : null
    });
    const { content } = request.data;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      throw new HttpsError("invalid-argument", "Content is required and must be a non-empty string");
    }
    const chatService = container.get(ChatService);
    const chatData = await chatService.createChat(uid);
    const chatId = chatData._key;
    const messageService = container.get(MessageService);
    const messageId = await messageService.createUserMessage(uid, content, chatId);
    console.log('[createChatWithMessage] Created message:', {
      messageId,
      chatId,
      userId: uid
    });
    return { chatId, messageId };
  }
);
export const processMessage = onValueCreated(
  {
    ref: "/messages/{messageId}",
    region: "us-central1"
  },
  async (event) => {
    const messageId = event.params.messageId;
    const message = event.data.val() as MessageModel;
    console.log("New message detected", { messageId, message });
    if (message.role !== "user" || message.status !== "pending") {
      console.log("Skipping - not a pending user message", {
        role: message.role,
        status: message.status
      });
      return;
    }
    try {
      const messageProcessingService = container.get(MessageProcessingService);
      await messageProcessingService.processUserMessage(
        messageId,
        message,
        event.data.ref
      );
    } catch (error) {
      console.error("Error processing message", { messageId, error });
      await event.data.ref.update({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
);
