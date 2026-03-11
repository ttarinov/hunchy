import { useEffect, useState, useRef } from 'react';
import { onValue, onChildAdded, onChildChanged, Database } from 'firebase/database';
import type { Message } from '../types/chat.js';
import { MessageStatus } from '../types/enums.js';
import { getMessagesRef } from '../utils/firebase-helpers.js';
export function useFirebaseMessages(
  database: Database | null,
  chatId: string | null,
  userId: string | undefined,
  messagesPath: string | undefined
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesMapRef = useRef<Map<string, Message>>(new Map());
  const initializedRef = useRef(false);
  useEffect(() => {
    if (!database || !chatId || !messagesPath || !userId) {
      return;
    }
    const messagesRef = getMessagesRef(database, messagesPath);
    messagesMapRef.current.clear();
    initializedRef.current = false;
    const updateMessages = () => {
      const messageList = Array.from(messagesMapRef.current.values())
        .filter(msg => msg.chatId === chatId && msg.userId === userId)
        .sort((a, b) => a.createdAt - b.createdAt);
      setMessages(messageList);
      const latestAgentMessage = messageList
        .filter(m => m.role === 'agent')
        .sort((a, b) => b.createdAt - a.createdAt)[0];
      const isPending = latestAgentMessage ?
        latestAgentMessage.status === MessageStatus.PENDING :
        false;
      setIsProcessing(isPending);
    };
    const handleIncrementalMessage = (snapshot: any) => {
      if (!initializedRef.current) return;
      const id = snapshot.key;
      if (!id) return;
      const msg = snapshot.val();
      if (msg.chatId === chatId && msg.userId === userId) {
        messagesMapRef.current.set(id, { ...msg, id });
        updateMessages();
      }
    };
    const unsubscribeInitial = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        initializedRef.current = true;
        updateMessages();
        return;
      }
      const data = snapshot.val();
      messagesMapRef.current.clear();
      Object.entries(data).forEach(([id, msg]: [string, any]) => {
        if (msg.chatId === chatId && msg.userId === userId) {
          messagesMapRef.current.set(id, { ...msg, id });
        }
      });
      initializedRef.current = true;
      updateMessages();
    });
    const unsubscribeAdded = onChildAdded(messagesRef, handleIncrementalMessage);
    const unsubscribeChanged = onChildChanged(messagesRef, handleIncrementalMessage);
    return () => {
      unsubscribeInitial();
      unsubscribeAdded();
      unsubscribeChanged();
      messagesMapRef.current.clear();
      initializedRef.current = false;
    };
  }, [chatId, database, messagesPath, userId]);
  return { messages, isProcessing };
}
