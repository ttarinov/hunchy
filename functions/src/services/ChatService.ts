import { injectable } from "inversify";
import { FirebaseService } from "./FirebaseService";
import { ChatModel, ChatData } from "../models/ChatModel";
@injectable()
export class ChatService {
  constructor(
    private firebaseService: FirebaseService
  ) {}
  public async createChat(
    userId: string,
    title?: string
  ): Promise<ChatData> {
    const chatRef = this.firebaseService.database().ref("chats").push();
    const chatId = chatRef.key!;
    const now = Date.now();
    const newChat: ChatModel = {
      userId,
      title: title || `Chat ${new Date().toLocaleDateString()}`,
      createdAt: now,
      updatedAt: now,
      lastMessageAt: now,
      messageCount: 0,
      status: "active"
    };
    await chatRef.set(newChat);
    console.log("New chat created", { chatId, newChat });
    return { ...newChat, _key: chatId };
  }
  public async getChat(chatId: string): Promise<ChatData | null> {
    const chatRef = this.firebaseService.database().ref(`chats/${chatId}`);
    const chatSnapshot = await chatRef.get();
    if (!chatSnapshot.exists()) {
      return null;
    }
    const chatData = chatSnapshot.val() as ChatModel;
    return { ...chatData, _key: chatId };
  }
  public async getUserChats(userId: string): Promise<ChatData[]> {
    const chatsRef = this.firebaseService.database().ref("chats");
    const chatsQuery = chatsRef.orderByChild("userId").equalTo(userId);
    const chatsSnapshot = await chatsQuery.get();
    if (!chatsSnapshot.exists()) {
      return [];
    }
    const chats: ChatData[] = [];
    chatsSnapshot.forEach((child) => {
      chats.push({ ...child.val() as ChatModel, _key: child.key! });
    });
    return chats.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
  }
  public async updateChatMetadata(
    chatId: string,
    updates: Partial<Pick<ChatModel, "title" | "lastMessageAt" | "messageCount" | "status">>
  ): Promise<void> {
    const chatRef = this.firebaseService.database().ref(`chats/${chatId}`);
    const updatePayload = {
      ...updates,
      updatedAt: Date.now()
    };
    await chatRef.update(updatePayload);
    console.log("Chat metadata updated", { chatId, updates: updatePayload });
  }
  public async incrementMessageCount(chatId: string): Promise<void> {
    const chatRef = this.firebaseService.database().ref(`chats/${chatId}`);
    await chatRef.transaction((currentData) => {
      if (currentData) {
        return {
          ...currentData,
          messageCount: (currentData.messageCount || 0) + 1,
          updatedAt: Date.now()
        };
      }
      return currentData;
    });
  }
  public async getActiveChatForUser(userId: string): Promise<ChatData | null> {
    const chatsRef = this.firebaseService.database().ref("chats");
    const snapshot = await chatsRef
      .orderByChild("userId")
      .equalTo(userId)
      .once("value");
    if (!snapshot.exists()) return null;
    let latestChat: ChatData | null = null;
    let latestTimestamp = 0;
    snapshot.forEach((child) => {
      const chat = child.val();
      if (chat.status === "active" && chat.lastMessageAt > latestTimestamp) {
        latestChat = { ...chat, _key: child.key! };
        latestTimestamp = chat.lastMessageAt;
      }
    });
    return latestChat;
  }
}
