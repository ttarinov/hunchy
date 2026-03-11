import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useChatState } from '../context/chat-context.js';
import { MessageStream } from './message-stream.js';
import { InputPrompt } from './input-prompt.js';
import { ThinkingSpinner } from '../ui/spinner.js';
interface ShellProps {
  onCommand: (command: string) => Promise<void>;
}
export function Shell({ onCommand }: ShellProps) {
  const { isProcessing, isInApproval, currentMessage, sections } = useChatState();
  const [input, setInput] = useState('');
  const handleSubmit = async (value: string) => {
    if (!value.trim() || isProcessing || isInApproval) return;
    await onCommand(value);
    setInput('');
  };
  return (
    <Box flexDirection="column">
      {isProcessing && <ThinkingSpinner />}
      {currentMessage && (
        <MessageStream message={currentMessage} sections={sections} />
      )}
      {!isInApproval && !isProcessing && (
        <InputPrompt
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
}
