import React from 'react';
import { Box } from 'ink';
import { ChatProvider } from './context/chat-context.js';
import { Logo } from './ui/logo.js';
import { Shell } from './shell/shell.js';
interface AppProps {
  userEmail?: string;
  onCommand: (command: string) => Promise<void>;
}
export function App({ userEmail, onCommand }: AppProps) {
  return (
    <ChatProvider>
      <Box flexDirection="column">
        <Logo userEmail={userEmail} />
        <Shell onCommand={onCommand} />
      </Box>
    </ChatProvider>
  );
}
