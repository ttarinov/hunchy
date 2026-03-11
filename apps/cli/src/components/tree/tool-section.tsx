import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
import { formatToolTitle, formatStatusText } from '../../utils/tree/tree-formatter.js';
import { SectionStatus } from '../../types/enums.js';
import type { ToolUseDetails } from '../../types/commit.js';
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
interface ToolSectionProps {
  section: CollapsibleSection;
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
}
export function ToolSection({ section, isExpanded, isLast }: ToolSectionProps) {
  const toolTitle = formatToolTitle(section);
  const isRunning = section.metadata?.status === SectionStatus.RUNNING;
  const isDone = section.metadata?.status === SectionStatus.DONE;
  const isError = section.metadata?.status === SectionStatus.ERROR;
  const dotColor = isRunning ? 'gray' : isDone ? 'cyan' : isError ? 'red' : 'cyan';
  const statusIcon = isDone ? '✓' : isError ? '✗' : '';
  const toolDetails = section.details as ToolUseDetails | undefined;
  const hasDetails = toolDetails && 'result' in toolDetails && toolDetails.result !== undefined;
  return (
    <Box flexDirection="column" marginLeft={1}>
      <Box>
        {isRunning ? (
          <BlinkingDot />
        ) : (
          <Text color={dotColor}>⏺ </Text>
        )}
        <Text color={dotColor}>{toolTitle}</Text>
        {statusIcon && (
          <>
            <Text dimColor> · </Text>
            <Text>{statusIcon}</Text>
          </>
        )}
      </Box>
      {hasDetails && toolDetails && (
        <Box flexDirection="column" marginLeft={3}>
          {renderToolDetails(toolDetails, isExpanded)}
        </Box>
      )}
    </Box>
  );
}
function renderToolDetails(details: ToolUseDetails, isExpanded: boolean): React.ReactNode {
  if (details && 'result' in details && details.result !== undefined) {
    const result = details.result;
    let lineCount: number | null = null;
    if (typeof result === 'string') {
      lineCount = result.split('\n').filter(l => l.trim().length > 0).length;
    }
    const resultString = typeof result === 'string' ? result : JSON.stringify(result, null, 2);
    const allLines = resultString.split('\n');
    const firstLine = allLines[0] || '';
    const remainingLines = allLines.slice(1);
    const hasMore = remainingLines.length > 0;
    const isGitDiff = resultString.includes('diff --git');
    const renderLine = (line: string, index: number) => {
      if (isGitDiff) {
        const isDiffGitLine = line.trim().startsWith('diff --git');
        return (
          <Box key={index}>
            <Text dimColor={!isDiffGitLine}>     {line}</Text>
          </Box>
        );
      } else {
        return (
          <Box key={index}>
            <Text>     {line}</Text>
          </Box>
        );
      }
    };
    if (isExpanded) {
      const linesToShow = allLines.slice(0, 20);
      return (
        <Box flexDirection="column">
          {lineCount !== null && lineCount > 0 && (
            <Box>
              <Text>⎿  Read {lineCount} line{lineCount !== 1 ? 's' : ''}</Text>
            </Box>
          )}
          {linesToShow.map((line, i) => renderLine(line, i))}
          {allLines.length > 20 && (
            <Box>
              <Text dimColor>     ... ({allLines.length - 20} more lines)</Text>
            </Box>
          )}
        </Box>
      );
    } else {
      return (
        <Box flexDirection="column">
          {lineCount !== null && lineCount > 0 && (
            <Box>
              <Text>⎿  Read {lineCount} line{lineCount !== 1 ? 's' : ''}</Text>
            </Box>
          )}
          {firstLine && renderLine(firstLine, 0)}
          {hasMore && (
            <Box>
              <Text dimColor>     ... ({remainingLines.length} more lines)</Text>
            </Box>
          )}
        </Box>
      );
    }
  }
  return null;
}
