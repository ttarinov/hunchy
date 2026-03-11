import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import gradient from 'gradient-string';
import type { PendingApproval } from '../../hooks/useToolApprovals.js';

interface ToolApprovalProps {
  approval: PendingApproval;
  onApprove: () => Promise<void>;
  onReject: () => void;
}

export function ToolApproval({ approval, onApprove, onReject }: ToolApprovalProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const options = [
    { id: 'approve', label: 'Approve' },
    { id: 'reject', label: 'Reject' }
  ];

  useInput((input, key) => {
    if (isSubmitting) return;

    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    } else if (key.downArrow && selectedIndex < options.length - 1) {
      setSelectedIndex(prev => prev + 1);
    } else if (key.return) {
      setIsSubmitting(true);
      const selectedOption = options[selectedIndex];
      if (selectedOption.id === 'approve') {
        onApprove();
      } else if (selectedOption.id === 'reject') {
        onReject();
      }
    } else if (key.escape) {
      onReject();
    }
  }, { isActive: true });

  const separator = '─'.repeat(100);

  // Special handling for git_commit tool
  if (approval.toolName === 'git_commit') {
    const message = approval.input.message as string;
    const files = approval.input.files as string[];
    const description = approval.input.description as string;
    const type = approval.input.type as string;
    const scope = approval.input.scope as string | undefined;

    const commitMessageGradient = gradient(['#87ceeb', '#0284c7'])(message);

    return (
      <Box flexDirection="column">
        <Text>{separator}</Text>

        <Box marginTop={1}>
          <Text bold color="cyan">AI wants to create a commit:</Text>
        </Box>

        <Box flexDirection="column" marginTop={1} marginLeft={2}>
          <Box>
            <Text bold>Message: </Text>
            <Text>{commitMessageGradient}</Text>
          </Box>

          <Box marginTop={1}>
            <Text bold>Type: </Text>
            <Text color="yellow">{type}</Text>
            {scope && (
              <>
                <Text> </Text>
                <Text bold>Scope: </Text>
                <Text color="magenta">{scope}</Text>
              </>
            )}
          </Box>

          {description && (
            <Box marginTop={1} flexDirection="column">
              <Text bold>Description:</Text>
              <Text dimColor marginLeft={2}>{description}</Text>
            </Box>
          )}

          <Box marginTop={1} flexDirection="column">
            <Text bold>Files ({files.length}):</Text>
            {files.map((file, i) => (
              <Text key={i} dimColor marginLeft={2}>- {file}</Text>
            ))}
          </Box>
        </Box>

        <Box marginTop={2} marginBottom={1}>
          <Text bold>What do you want to do?</Text>
        </Box>

        <Box flexDirection="column" marginTop={1}>
          {options.map((option, index) => {
            const isSelected = index === selectedIndex;
            return (
              <Box key={option.id}>
                <Text color={isSelected ? 'cyan' : 'gray'}>
                  {isSelected ? '❯ ' : '  '}
                </Text>
                <Text color={isSelected ? 'cyan' : 'white'}>
                  {index + 1}. {option.label}
                </Text>
              </Box>
            );
          })}
        </Box>

        <Box marginTop={2}>
          <Text dimColor>Enter to confirm · escape to cancel</Text>
        </Box>
      </Box>
    );
  }

  // Generic tool approval UI
  return (
    <Box flexDirection="column">
      <Text>{separator}</Text>

      <Box marginTop={1}>
        <Text bold color="cyan">AI wants to execute: </Text>
        <Text bold color="yellow">{approval.toolName}</Text>
      </Box>

      <Box flexDirection="column" marginTop={1} marginLeft={2}>
        <Text bold>Parameters:</Text>
        <Text dimColor>{JSON.stringify(approval.input, null, 2)}</Text>
      </Box>

      <Box marginTop={2} marginBottom={1}>
        <Text bold>What do you want to do?</Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        {options.map((option, index) => {
          const isSelected = index === selectedIndex;
          return (
            <Box key={option.id}>
              <Text color={isSelected ? 'cyan' : 'gray'}>
                {isSelected ? '❯ ' : '  '}
              </Text>
              <Text color={isSelected ? 'cyan' : 'white'}>
                {index + 1}. {option.label}
              </Text>
            </Box>
          );
        })}
      </Box>

      <Box marginTop={2}>
        <Text dimColor>Enter to confirm · escape to cancel</Text>
      </Box>
    </Box>
  );
}
