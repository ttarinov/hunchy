import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { Message } from '../../types/chat.js';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
interface ChatState {
  chatId: string | null;
  isProcessing: boolean;
  isInApproval: boolean;
  messages: Message[];
  sections: CollapsibleSection[];
  currentMessage: Message | null;
}
interface ChatContextValue extends ChatState {
  setChatId: (chatId: string | null) => void;
  setProcessing: (isProcessing: boolean) => void;
  setApproval: (isInApproval: boolean) => void;
  addMessage: (message: Message) => void;
  setSections: (sections: CollapsibleSection[]) => void;
  setCurrentMessage: (message: Message | null) => void;
}
const ChatContext = createContext<ChatContextValue | null>(null);
export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>({
    chatId: null,
    isProcessing: false,
    isInApproval: false,
    messages: [],
    sections: [],
    currentMessage: null
  });
  const setChatId = useCallback((chatId: string | null) => {
    setState(prev => ({ ...prev, chatId }));
  }, []);
  const setProcessing = useCallback((isProcessing: boolean) => {
    setState(prev => ({ ...prev, isProcessing }));
  }, []);
  const setApproval = useCallback((isInApproval: boolean) => {
    setState(prev => ({ ...prev, isInApproval }));
  }, []);
  const addMessage = useCallback((message: Message) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, message] }));
  }, []);
  const setSections = useCallback((sections: CollapsibleSection[]) => {
    setState(prev => ({ ...prev, sections }));
  }, []);
  const setCurrentMessage = useCallback((currentMessage: Message | null) => {
    setState(prev => ({ ...prev, currentMessage }));
  }, []);
  return (
    <ChatContext.Provider value={{
      ...state,
      setChatId,
      setProcessing,
      setApproval,
      addMessage,
      setSections,
      setCurrentMessage
    }}>
      {children}
    </ChatContext.Provider>
  );
}
export function useChatState() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatState must be used within ChatProvider');
  }
  return context;
}
