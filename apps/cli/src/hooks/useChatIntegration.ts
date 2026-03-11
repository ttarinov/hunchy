import { useState, useCallback } from 'react';
import { ChatInitializer } from '../services/chat/chat-initializer.js';
import { ChatMessageHandler } from '../services/chat/chat-message-handler.js';
export function useChatIntegration() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [chatInitializer] = useState(() => new ChatInitializer());
  const [chatMessageHandler] = useState(() => new ChatMessageHandler(chatInitializer));
  const sendMessage = useCallback(async (message: string) => {
    return new Promise<{ messageId: string; chatId: string }>((resolve, reject) => {
      chatMessageHandler.handleMessage(message, chatId, (messageId, newChatId) => {
        if (newChatId) {
          setChatId(newChatId);
          resolve({ messageId, chatId: newChatId });
        } else {
          resolve({ messageId, chatId: chatId || '' });
        }
      }).catch(reject);
    });
  }, [chatId, chatMessageHandler]);
  const getState = useCallback(() => {
    return chatMessageHandler.getState();
  }, [chatMessageHandler]);
  return {
    chatId,
    sendMessage,
    getState
  };
}
