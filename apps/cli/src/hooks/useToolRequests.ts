import { useEffect, useRef } from 'react';
import { onValue, onChildAdded, set, Database } from 'firebase/database';
import { ToolExecutor } from '../services/tool-executor.js';
import type { ToolRequest } from '../types/tool.js';
import { ToolRequestStatus } from '../types/enums.js';
import { getErrorMessage } from '../utils/error-utils.js';
import { getMessagesRef, getToolRequestsRef, getToolRequestRef, updateToolRequestStatus } from '../utils/firebase-helpers.js';
export function useToolRequests(
  database: Database | null,
  chatId: string | null,
  userId: string | undefined,
  messagesPath: string | undefined
) {
  const executedRequestsRef = useRef<Set<string>>(new Set());
  const toolExecutorRef = useRef<ToolExecutor | null>(null);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  useEffect(() => {
    if (!database || !chatId || !messagesPath || !userId) {
      return;
    }
    if (!toolExecutorRef.current) {
      toolExecutorRef.current = new ToolExecutor();
    }
    const messagesRef = getMessagesRef(database, messagesPath);
    const unsubscribeMessages = onValue(messagesRef, (snapshot) => {
      if (!snapshot.exists()) {
        return;
      }
      const messages = snapshot.val();
      Object.entries(messages).forEach(([messageId, msg]: [string, any]) => {
        if (msg.chatId !== chatId || msg.userId !== userId) {
          return;
        }
        const toolRequestsRef = getToolRequestsRef(database, messagesPath, messageId);
        if (subscriptionsRef.current.has(messageId)) {
          return;
        }
        const unsubscribe = onChildAdded(toolRequestsRef, async (toolSnapshot) => {
          const toolRequestId = toolSnapshot.key;
          if (!toolRequestId) return;
          const uniqueKey = `${messageId}/${toolRequestId}`;
          if (executedRequestsRef.current.has(uniqueKey)) {
            return;
          }
          const toolRequest = toolSnapshot.val() as ToolRequest;
          if (toolRequest.status !== ToolRequestStatus.PENDING) {
            return;
          }
          const requestRef = getToolRequestRef(database, messagesPath, messageId, toolRequestId);
          await set(requestRef, {
            ...toolRequest,
            status: ToolRequestStatus.EXECUTING
          });
          executedRequestsRef.current.add(uniqueKey);
          try {
            const executor = toolExecutorRef.current!;
            const result = await executor.executeTool(toolRequest.tool, toolRequest.input || {});
            await updateToolRequestStatus(
              database,
              messagesPath,
              messageId,
              toolRequestId,
              result.success ? ToolRequestStatus.COMPLETED : ToolRequestStatus.ERROR,
              result
            );
          } catch (error) {
            await set(requestRef, {
              ...toolRequest,
              status: ToolRequestStatus.ERROR,
              error: getErrorMessage(error)
            });
          }
        });
        subscriptionsRef.current.set(messageId, unsubscribe);
      });
    });
    return () => {
      unsubscribeMessages();
      subscriptionsRef.current.forEach((unsubscribe) => unsubscribe());
      subscriptionsRef.current.clear();
    };
  }, [database, chatId, userId, messagesPath]);
}
