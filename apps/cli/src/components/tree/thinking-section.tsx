import React from 'react';
import { Box, Text } from 'ink';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
interface ThinkingSectionProps {
  section: CollapsibleSection;
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
}
export function ThinkingSection({ section, isExpanded, isLast }: ThinkingSectionProps) {
  const prefix = isLast ? '└─' : '├─';
  return (
    <Box flexDirection="column" marginLeft={3}>
      <Box>
        <Text dimColor>{prefix} </Text>
        <Text color="yellow">💭 </Text>
        <Text>{section.summary}</Text>
      </Box>
      {isExpanded && section.details && (
        <Box flexDirection="column" marginLeft={2}>
          {String(section.details).split('\n').map((line, i) => (
            <Text key={i} dimColor>  {line}</Text>
          ))}
        </Box>
      )}
    </Box>
  );
}
