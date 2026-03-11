import React from 'react';
import { Box, Text } from 'ink';
import type { Message } from '../../types/chat.js';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
import { TreeView } from '../tree/TreeView.js';
import gradient from 'gradient-string';
interface MessageStreamProps {
  message: Message;
  sections: CollapsibleSection[];
}
function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^#{1,6}\s+(.+)$/gm, '$1')
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    .replace(/^[-*+]\s+(.+)$/gm, '$1')
    .replace(/^\d+\.\s+(.+)$/gm, '$1')
    .trim();
}
export function MessageStream({ message, sections }: MessageStreamProps) {
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
        <TreeView sections={sections} />
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
