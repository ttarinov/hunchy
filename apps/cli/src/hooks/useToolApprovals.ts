import { useEffect, useRef, useState } from 'react';
import { onValue, onChildAdded, set, Database } from 'firebase/database';
import { getMessagesRef } from '../utils/firebase-helpers.js';

export interface ToolApprovalRequest {
  toolName: string;
  input: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  userResponse?: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface PendingApproval extends ToolApprovalRequest {
  messageId: string;
  approvalId: string;
}

export function useToolApprovals(
  database: Database | null,
  chatId: string | null,
  userId: string | undefined,
  messagesPath: string | undefined
) {
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const subscriptionsRef = useRef<Map<string, () => void>>(new Map());
  const processedApprovalsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!database || !chatId || !messagesPath || !userId) {
      return;
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

        // Subscribe to toolApprovals for this message
        if (subscriptionsRef.current.has(messageId)) {
          return;
        }

        const approvalsRef = database.ref(`${messagesPath}/${messageId}/toolApprovals`);

        const unsubscribe = onChildAdded(approvalsRef, (approvalSnapshot) => {
          const approvalId = approvalSnapshot.key;
          if (!approvalId) return;

          const uniqueKey = `${messageId}/${approvalId}`;
          if (processedApprovalsRef.current.has(uniqueKey)) {
            return;
          }

          const approval = approvalSnapshot.val() as ToolApprovalRequest;

          if (approval.status === 'pending') {
            processedApprovalsRef.current.add(uniqueKey);

            setPendingApprovals((prev) => [
              ...prev,
              {
                ...approval,
                messageId,
                approvalId
              }
            ]);
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

  const approveRequest = async (messageId: string, approvalId: string) => {
    if (!database || !messagesPath) return;

    const approvalRef = database.ref(`${messagesPath}/${messageId}/toolApprovals/${approvalId}`);
    await set(approvalRef, {
      toolName: pendingApprovals.find(a => a.approvalId === approvalId)?.toolName,
      input: pendingApprovals.find(a => a.approvalId === approvalId)?.input,
      timestamp: pendingApprovals.find(a => a.approvalId === approvalId)?.timestamp,
      status: 'approved',
      userResponse: 'approve'
    });

    setPendingApprovals((prev) => prev.filter(a => a.approvalId !== approvalId));
  };

  const rejectRequest = async (messageId: string, approvalId: string, reason?: string) => {
    if (!database || !messagesPath) return;

    const approvalRef = database.ref(`${messagesPath}/${messageId}/toolApprovals/${approvalId}`);
    await set(approvalRef, {
      toolName: pendingApprovals.find(a => a.approvalId === approvalId)?.toolName,
      input: pendingApprovals.find(a => a.approvalId === approvalId)?.input,
      timestamp: pendingApprovals.find(a => a.approvalId === approvalId)?.timestamp,
      status: 'rejected',
      userResponse: 'reject',
      rejectionReason: reason
    });

    setPendingApprovals((prev) => prev.filter(a => a.approvalId !== approvalId));
  };

  return {
    pendingApprovals,
    approveRequest,
    rejectRequest
  };
}
