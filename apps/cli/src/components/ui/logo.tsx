import React from 'react';
import { Box, Text } from 'ink';
import gradient from 'gradient-string';
interface LogoProps {
  userEmail?: string;
}
export function Logo({ userEmail }: LogoProps) {
  const blueGradient = gradient(['#0ea5e9', '#06b6d4']);
  const logo = `
█ █ █ █ █▄ █ ▄▀▀ █ █ █▄█
█▀█ █▄█ █ ▀█ ▀▄▄ █▀█  █
`;
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text>{blueGradient(logo)}</Text>
      {userEmail && (
        <Text dimColor>Logged in as {userEmail}</Text>
      )}
    </Box>
  );
}
