import React from 'react';
import { Box } from 'ink';
import { ChatProvider, useChatState } from './context/chat-context.js';
import { WelcomeScreen } from './ui/welcome-screen.js';
import { EnhancedShell } from './shell/enhanced-shell.js';
interface AppWithShellProps {
  userEmail?: string;
  onExit?: () => void;
}
function AppContent({ userEmail, onExit }: AppWithShellProps) {
  const { messages, chatId } = useChatState();
  const [isCommandExecuting, setIsCommandExecuting] = React.useState(false);
  const showWelcomeScreen = messages.length === 0 && !chatId;
  return (
    <Box flexDirection="column">
      {showWelcomeScreen && <WelcomeScreen userEmail={userEmail} />}
      <EnhancedShell onExit={onExit} onCommandStart={() => setIsCommandExecuting(true)} onCommandEnd={() => setIsCommandExecuting(false)} />
    </Box>
  );
}
export function AppWithShell({ userEmail, onExit }: AppWithShellProps) {
  return (
    <ChatProvider>
      <AppContent userEmail={userEmail} onExit={onExit} />
    </ChatProvider>
  );
}
