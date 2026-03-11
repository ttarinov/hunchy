import { ref, update, set, push, Database, type DatabaseReference } from 'firebase/database';
import type { CollapsibleSection } from '../types/collapsible-section.js';
import type { ToolRequest, ToolResult } from '../types/tool.js';
import type { Message } from '../types/chat.js';
import { MessageStatus } from '../types/enums.js';
export function getMessageRef(database: Database, messagesPath: string, messageId: string): DatabaseReference {
  return ref(database, `${messagesPath}/${messageId}`);
}
export function getToolRequestRef(
  database: Database,
  messagesPath: string,
  messageId: string,
  toolRequestId: string
): DatabaseReference {
  return ref(database, `${messagesPath}/${messageId}/toolRequests/${toolRequestId}`);
}
export function getMessagesRef(database: Database, messagesPath: string): DatabaseReference {
  return ref(database, messagesPath);
}
export function getToolRequestsRef(database: Database, messagesPath: string, messageId: string): DatabaseReference {
  return ref(database, `${messagesPath}/${messageId}/toolRequests`);
}
export async function createUserMessage(
  database: Database,
  messagesPath: string,
  userId: string,
  content: string,
  chatId: string
): Promise<string> {
  const messagesRef = getMessagesRef(database, messagesPath);
  const messageRef = push(messagesRef);
  const messageId = messageRef.key!;
  const userMessage: Message = {
    userId,
    role: 'user',
    content,
    createdAt: Date.now(),
    status: MessageStatus.PENDING,
    chatId,
  };
  await set(messageRef, userMessage);
  return messageId;
}
export async function updateMessageSections(
  database: Database,
  messagesPath: string,
  messageId: string,
  sections: CollapsibleSection[]
): Promise<void> {
  try {
    const messageRef = getMessageRef(database, messagesPath, messageId);
    await update(messageRef, {
      sections,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.warn('Failed to update message sections:', err);
    throw err;
  }
}
export async function updateToolRequestStatus(
  database: Database,
  messagesPath: string,
  messageId: string,
  toolRequestId: string,
  status: ToolRequest['status'],
  result?: ToolResult
): Promise<void> {
  try {
    const requestRef = getToolRequestRef(database, messagesPath, messageId, toolRequestId);
    const updateData: Partial<ToolRequest> = {
      status
    };
    if (result) {
      if (result.success && result.result !== undefined) {
        updateData.result = result.result;
      }
      if (!result.success && result.error) {
        updateData.error = result.error;
      }
    }
    await set(requestRef, updateData);
  } catch (err) {
    console.warn('Failed to update tool request status:', err);
    throw err;
  }
}
export async function batchUpdateMessageSections(
  database: Database,
  messagesPath: string,
  updates: Array<{ messageId: string; sections: CollapsibleSection[] }>
): Promise<void> {
  try {
    const updatePromises = updates.map(({ messageId, sections }) => {
      const messageRef = getMessageRef(database, messagesPath, messageId);
      return update(messageRef, {
        sections,
        updatedAt: Date.now()
      });
    });
    await Promise.all(updatePromises);
  } catch (err) {
    console.warn('Failed to batch update message sections:', err);
    throw err;
  }
}
