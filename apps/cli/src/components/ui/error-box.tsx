import React from 'react';
import { Box, Text } from 'ink';
interface ErrorBoxProps {
  title: string;
  error?: string;
  suggestion?: string;
}
export function ErrorBox({ title, error, suggestion }: ErrorBoxProps) {
  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color="red" bold>✗ {title}</Text>
      {error && (
        <Box marginLeft={2}>
          <Text dimColor>Error: </Text>
          <Text>{error}</Text>
        </Box>
      )}
      {suggestion && (
        <Box marginLeft={2} marginTop={1}>
          <Text dimColor>{suggestion}</Text>
        </Box>
      )}
    </Box>
  );
}
