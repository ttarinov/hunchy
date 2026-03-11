import React from 'react';
import { Box, Text } from 'ink';
export function WelcomeMessage() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color="cyan">AI-powered commit intelligence for your git workflow</Text>
      <Box marginTop={1}>
        <Text dimColor>Quick start:</Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>• Type </Text>
        <Text color="cyan">auth</Text>
        <Text dimColor> or </Text>
        <Text color="cyan">hunchy auth</Text>
        <Text dimColor> to authenticate</Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>• Type </Text>
        <Text color="cyan">help</Text>
        <Text dimColor> for available commands</Text>
      </Box>
      <Box marginLeft={2}>
        <Text dimColor>• Press </Text>
        <Text color="cyan">Ctrl+C</Text>
        <Text dimColor> to exit</Text>
      </Box>
    </Box>
  );
}
