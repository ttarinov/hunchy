import React from 'react';
import { Box, Text } from 'ink';
import type { ParsedCommit } from '../../utils/commit/commit-parser.js';
import { getCommitTypeColor, getComplexityColor } from '../../utils/commit/commit-colors.js';
interface CommitProposalProps {
  commit: ParsedCommit;
  index: number;
  total: number;
}
export function CommitProposal({ commit, index, total }: CommitProposalProps) {
  const typeColor = getCommitTypeColor(commit.type);
  const complexityColor = getComplexityColor(commit.complexity);
  return (
    <Box flexDirection="column" paddingY={1}>
      <Box>
        <Text bold color="blue">Commit </Text>
        <Text>{index + 1} of {total}  </Text>
        <Text>{typeColor(`[${commit.type}]`)}</Text>
        <Text>  {commit.message}</Text>
      </Box>
      <Box flexDirection="column" marginLeft={2} marginTop={1}>
        {commit.bullets.map((bullet, i) => (
          <Box key={i}>
            <Text dimColor>- </Text>
            <Text>{bullet}</Text>
          </Box>
        ))}
      </Box>
      {commit.files.length > 0 && (
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>Files: </Text>
          <Text>{commit.files.join(', ')}</Text>
        </Box>
      )}
      {commit.timeEstimate && (
        <Box marginLeft={2}>
          <Text dimColor>Est. time: </Text>
          <Text color="cyan">{commit.timeEstimate}</Text>
        </Box>
      )}
      {commit.hash && (
        <Box marginLeft={2} marginTop={1}>
          <Text color="green">✓ Commit created (</Text>
          <Text color="cyan">{commit.hash}</Text>
          <Text color="green">)</Text>
        </Box>
      )}
    </Box>
  );
}
