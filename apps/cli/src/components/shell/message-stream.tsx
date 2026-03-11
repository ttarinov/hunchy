import React from 'react';
import { Box, Text } from 'ink';
import type { Message } from '../../types/chat.js';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
import { TreeView } from '../tree/tree-view.js';
import gradient from 'gradient-string';
interface MessageStreamProps {
  message: Message;
  sections: CollapsibleSection[];
  isLatest?: boolean;
  hideProposalsDuringApproval?: boolean;
}
function stripMarkdown(text: string): string {
  if (!text) return '';
  let cleaned = text
    .replace(/```[\s\S]*?```/g, '') 
    .replace(/`([^`]+)`/g, '$1') // Remove inline code
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Remove bold
    .replace(/\*([^*]+)\*/g, '$1') // Remove italic
    .replace(/^#{1,6}\s+(.+)$/gm, '$1') // Remove headers
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Remove links
    .replace(/^[-*+]\s+(.+)$/gm, '$1') // Remove list markers
    .replace(/^\d+\.\s+(.+)$/gm, '$1') // Remove numbered list markers
    .replace(/\n{3,}/g, '\n\n'); // Collapse multiple newlines
  // Remove COMMIT PROPOSAL: blocks (they're shown as sections, not in text)
  cleaned = cleaned.replace(/COMMIT PROPOSAL:[\s\S]*?(?=COMMIT PROPOSAL:|$)/gi, '').trim();
  return cleaned.trim();
}
export function MessageStream({ 
  message, 
  sections, 
  isLatest = false,
  hideProposalsDuringApproval = false
}: MessageStreamProps) {
  const hunchyLabel = gradient(['#0ea5e9', '#06b6d4']).multiline('Hunchy');
  if (message.role === 'agent' && sections.length > 0) {
    const cleanedContent = message.content ? stripMarkdown(message.content) : '';
    return (
      <Box flexDirection="column">
        {cleanedContent && (
          <Box flexDirection="column" paddingY={1}>
            <Text bold>{hunchyLabel}: </Text>
            <Text>{cleanedContent}</Text>
          </Box>
        )}
        <TreeView 
          sections={sections} 
          isActive={isLatest} 
          messageId={message.id}
          hideProposalsDuringApproval={hideProposalsDuringApproval}
        />
      </Box>
    );
  }
  if (message.content) {
    const cleanedContent = message.role === 'agent' ? stripMarkdown(message.content) : message.content;
    return (
      <Box flexDirection="column" paddingY={1}>
        {message.role === 'user' ? (
          <Text>{'> '}{cleanedContent}</Text>
        ) : (
          <>
            <Text bold>{hunchyLabel}: </Text>
            <Text>{cleanedContent}</Text>
          </>
        )}
      </Box>
    );
  }
  return null;
}
