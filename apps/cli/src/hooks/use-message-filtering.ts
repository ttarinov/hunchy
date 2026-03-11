import { useMemo } from 'react';
import type { Message } from '../types/chat.js';
import type { CollapsibleSection } from '../types/collapsible-section.js';
interface UseMessageFilteringOptions {
  messages: Message[];
}
export function useMessageFiltering({
  messages
}: UseMessageFilteringOptions) {
  const filteredMessages = useMemo(() => {
    const seenIds = new Set<string>();
    const result: Array<{ message: Message; sections: CollapsibleSection[] }> = [];
    for (const message of messages) {
      const messageId = message.id || `${message.createdAt}-${message.role}`;
      if (!seenIds.has(messageId)) {
        seenIds.add(messageId);
        const messageSections: CollapsibleSection[] = message.sections || [];
        result.push({
          message,
          sections: messageSections
        });
      }
    }
    return result;
  }, [messages]);
  return filteredMessages;
}
