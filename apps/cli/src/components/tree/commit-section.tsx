import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
import type { CommitExecutionDetails } from '../../types/commit.js';
import { SectionStatus } from '../../types/enums.js';
function BlinkingDot() {
  const [dimmed, setDimmed] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      setDimmed(prev => !prev);
    }, 500); 
    return () => clearInterval(interval);
  }, []);
  return <Text color="gray" dimColor={dimmed}>⏺ </Text>;
}
interface CommitSectionProps {
  section: CollapsibleSection;
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
}
export function CommitSection({ section, isExpanded, isLast }: CommitSectionProps) {
  const isRunning = section.metadata?.status === SectionStatus.RUNNING;
  const isDone = section.metadata?.status === SectionStatus.DONE;
  const isError = section.metadata?.status === SectionStatus.ERROR;
  const details = section.details as CommitExecutionDetails | undefined;
  const hash = details?.hash || '';
  const shortHash = hash ? hash.substring(0, 7) : '';
  const message = details?.message || section.title.replace(/^\d+\.\s*/, '');
  const truncatedMessage = message.length > 50 ? message.substring(0, 47) + '…' : message;
  const dotColor = isRunning ? 'gray' : isDone ? 'cyan' : isError ? 'red' : 'cyan';
  const statusIcon = isDone ? '✓' : isError ? '✗' : '';
  const numberMatch = section.title.match(/^(\d+)\./);
  const number = numberMatch ? numberMatch[1] : '';
  const hashDisplay = shortHash || '...';
  const displayText = `${number}. (-o- ${hashDisplay}) ${truncatedMessage}`;
  const commandsTree = details?.commands && details.commands.length > 0
    ? details.commands.map((cmd, index) => {
        let commandText = cmd;
        if (cmd.startsWith('git add')) {
          const files = details.files?.join(' ') || '';
          commandText = `git add ${files}`;
        }
        const commands = details.commands!;
        const isLast = index === commands.length - 1;
        const treeChar = isLast ? '└─' : '├─';
        return { treeChar, commandText };
      })
    : null;
  return (
    <Box flexDirection="column" marginLeft={1}>
      <Box flexDirection="column">
        <Box>
          {isRunning ? (
            <BlinkingDot />
          ) : (
            <Text color={dotColor}>⏺ </Text>
          )}
          <Text color={dotColor}>{displayText}</Text>
          {statusIcon && (
            <>
              <Text dimColor> · </Text>
              <Text>{statusIcon}</Text>
            </>
          )}
        </Box>
        {!isExpanded && isDone && commandsTree && (
          <Box flexDirection="column" marginLeft={2} marginTop={0}>
            {commandsTree.map((item, i) => (
              <Box key={i}>
                <Text dimColor>{item.treeChar} {item.commandText}</Text>
              </Box>
            ))}
          </Box>
        )}
      </Box>
      {isExpanded && details && (
        <Box flexDirection="column" marginLeft={3} marginTop={1}>
          {}
          {details.files && details.files.length > 0 && (
            <Box flexDirection="column" marginBottom={1}>
              {details.files.map((file, i) => (
                <Text key={i} dimColor>  - {file}</Text>
              ))}
            </Box>
          )}
          {}
          {details.commands && details.commands.length > 0 && (
            <Box flexDirection="column">
              {details.commands.map((cmd, i) => (
                <Text key={i} dimColor>  {cmd}</Text>
              ))}
            </Box>
          )}
          {}
          {hash && (
            <Box marginTop={1}>
              <Text dimColor>  Hash: {hash}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
