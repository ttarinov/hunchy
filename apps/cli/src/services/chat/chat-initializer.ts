import { ApiClient } from "../../auth/api-client.js";
import { DefaultClient } from "../../client/default-client.js";
import type { Database } from "firebase/database";
import { AuthTokenService } from "../auth-token-service.js";
export interface ChatState {
  userId: string | null;
  database: Database | null;
  messagesPath: string | null;
}
export class ChatInitializer {
  private chatInitialized: boolean = false;
  private state: ChatState = {
    userId: null,
    database: null,
    messagesPath: null,
  };
  async initialize(): Promise<ChatState> {
    if (this.chatInitialized) {
      return this.state;
    }
    const apiClient = new ApiClient();
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      throw new Error("Not authenticated");
    }
    const backendClient = apiClient.getBackendClient();
    if (!(backendClient instanceof DefaultClient)) {
      throw new Error("Backend client not initialized");
    }
    await backendClient.initialize();
    const customToken = await apiClient.getConfigManager().getCustomToken();
    const authTokenService = new AuthTokenService(apiClient);
    try {
      const idToken = await authTokenService.getAuthTokenOrThrow();
      if (customToken && idToken) {
        await backendClient.authenticate(idToken, customToken);
      }
    } catch {
      throw new Error("Not authenticated");
    }
    const auth = (backendClient as any).auth;
    if (auth?.currentUser) {
      this.state.userId = auth.currentUser.uid;
    } else {
      const config = await apiClient.getConfigManager().load();
      this.state.userId = config.userId || null;
    }
    if (!this.state.userId) {
      throw new Error("User ID not found");
    }
    this.state.database = (backendClient as any).database;
    if (!this.state.database) {
      throw new Error("Database not initialized");
    }
    this.state.messagesPath = (await apiClient.getConfigManager().getMessagesPath()) || null;
    if (!this.state.messagesPath) {
      throw new Error("Configuration incomplete");
    }
    this.chatInitialized = true;
    return this.state;
  }
  getState(): ChatState {
    return this.state;
  }
  isInitialized(): boolean {
    return this.chatInitialized;
  }
}
