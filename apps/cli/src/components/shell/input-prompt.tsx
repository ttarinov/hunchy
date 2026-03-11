import React from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
interface InputPromptProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
}
export function InputPrompt({ value, onChange, onSubmit }: InputPromptProps) {
  return (
    <Box>
      <Text color="cyan">&gt; </Text>
      <TextInput
        value={value}
        onChange={onChange}
        onSubmit={onSubmit}
      />
    </Box>
  );
}
