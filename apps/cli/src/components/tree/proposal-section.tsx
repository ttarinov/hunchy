import React from 'react';
import { Box, Text } from 'ink';
import type { CollapsibleSection, CommitProposalData } from '../../types/collapsible-section.js';
import { SectionStatus } from '../../types/enums.js';
interface ProposalSectionProps {
  section: CollapsibleSection;
  isExpanded: boolean;
  isLast: boolean;
  onToggle: () => void;
}
export function ProposalSection({ section, isExpanded, isLast, onToggle }: ProposalSectionProps) {
  const isApproved = section.metadata?.approved === true;
  const isExecuted = section.metadata?.status === SectionStatus.EXECUTED;
  const isPending = !isApproved && !isExecuted;
  const dotColor = isExecuted ? 'cyan' : isApproved ? 'green' : 'gray';
  const statusIcon = isExecuted ? '✓ executed' : isApproved ? '✓ approved' : '';
  const details = section.details as CommitProposalData | undefined;
  const files = details?.files || [];
  const description = details?.description || [];
  const truncatedTitle = section.title.length > 60 
    ? section.title.substring(0, 57) + '…' 
    : section.title;
  return (
    <Box flexDirection="column" marginLeft={1}>
      <Box>
        <Text color={dotColor}>⏺ </Text>
        <Text color={dotColor}>{truncatedTitle}</Text>
        {statusIcon && (
          <>
            <Text dimColor> · </Text>
            <Text>{statusIcon}</Text>
          </>
        )}
      </Box>
      {!isExpanded && files.length > 0 && (isApproved || isExecuted) && (
        <Box flexDirection="column" marginLeft={2} marginTop={0}>
          <Text dimColor>  Files: {files.join(', ')}</Text>
        </Box>
      )}
      {isExpanded && (
        <Box flexDirection="column" marginLeft={3} marginTop={1}>
          {}
          {files.length > 0 && (
            <Box flexDirection="column" marginBottom={1}>
              <Text dimColor>Files:</Text>
              {files.map((file, i) => (
                <Text key={i} dimColor>  - {file}</Text>
              ))}
            </Box>
          )}
          {}
          {description.length > 0 && (
            <Box flexDirection="column">
              {description.map((desc, i) => (
                <Text key={i} dimColor>  {desc}</Text>
              ))}
            </Box>
          )}
          {}
          {description.length === 0 && section.summary && (
            <Box>
              <Text dimColor>  {section.summary}</Text>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
