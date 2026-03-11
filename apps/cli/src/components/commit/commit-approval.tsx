import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { ParsedCommit } from '../../utils/commit/commit-parser.js';
import gradient from 'gradient-string';
interface CommitApprovalProps {
  commits: ParsedCommit[];
  onApprove: () => Promise<void>;
  onReject: () => void;
  onFeedback?: (feedback: string) => Promise<void>;
}
export function CommitApproval({ commits, onApprove, onReject, onFeedback }: CommitApprovalProps) {
  const [selectedIndex, setSelectedIndex] = useState(commits.length); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const options = [
    { id: 'commit', label: 'Commit' },
    { id: 'reject', label: 'Reject' },
    { id: 'feedback', label: 'Give feedback' }
  ];
  const totalItems = commits.length + options.length;
  useInput((input, key) => {
    if (isSubmitting) return;
    if (key.upArrow && selectedIndex > 0) {
      setSelectedIndex(prev => prev - 1);
    } else if (key.downArrow && selectedIndex < totalItems - 1) {
      setSelectedIndex(prev => prev + 1);
    } else if (key.return) {
      setIsSubmitting(true);
      if (selectedIndex < commits.length) {
        setSelectedIndex(commits.length);
      } else {
        const actionIndex = selectedIndex - commits.length;
        const selectedOption = options[actionIndex];
        if (selectedOption.id === 'commit') {
          onApprove();
        } else if (selectedOption.id === 'reject') {
          onReject();
        } else if (selectedOption.id === 'feedback' && onFeedback) {
          onReject(); 
        }
      }
    } else if (key.escape) {
      onReject();
    }
  }, { isActive: true });
  if (commits.length === 0) return null;
  const separator = '─'.repeat(100);
  return (
    <Box flexDirection="column">
      <Text>{separator}</Text>
      {}
      <Box flexDirection="column" marginTop={1}>
        {commits.map((commit, index) => {
          const isSelected = index === selectedIndex;
          const commitGradient = gradient(['#87ceeb', '#0284c7'])(commit.message);
          return (
            <Box key={index} flexDirection="column">
              <Box>
                <Text color={isSelected ? 'cyan' : 'gray'}>
                  {isSelected ? '❯ ' : '  '}
                </Text>
                <Text>
                  {index + 1}. {commitGradient}
                </Text>
              </Box>
              <Box flexDirection="column" marginLeft={4}>
                {}
                {commit.files.length > 0 && (
                  <Box flexDirection="column">
                    {commit.files.map((file, i) => (
                      <Text key={i} dimColor>  - {file}</Text>
                    ))}
                  </Box>
                )}
                {}
                {isSelected && commit.bullets.length > 0 && (
                  <Box marginTop={1} flexDirection="column">
                    {commit.bullets.map((bullet, i) => (
                      <Box key={i}>
                        <Text dimColor>- </Text>
                        <Text>{bullet}</Text>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
      {}
      <Box marginTop={2} marginBottom={1}>
        <Text bold>What do you want to do?</Text>
      </Box>
      <Box flexDirection="column" marginTop={1}>
        {options.map((option, index) => {
          const itemIndex = commits.length + index;
          const isSelected = itemIndex === selectedIndex;
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
