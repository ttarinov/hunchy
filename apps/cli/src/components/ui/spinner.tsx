import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import InkSpinner from 'ink-spinner';
import gradient from 'gradient-string';
interface SpinnerProps {
  text?: string;
}
const THINKING_MESSAGES = [
  'Thinking...',
  'Juggling',
  'Wrangling',
  'Untangling',
  'Tinkering',
  'Fiddling',
  'Mulling',
  'Sifting',
  'Weaving',
  'Blending',
  'Cherry-picking',
  'Staging',
  'Branching',
  'Rebasing',
  'Hashing',
  'Diffing',
  'Tweaking',
  'Polishing',
  'Crafting',
  'Musing',
  'Ruminating',
  'Pondering',
  'Scheming',
  'Plotting',
  'Brewing',
  'Concocting',
  'Whipping up',
  'Spinning',
  'Churning',
  'Stirring',
];
export function ThinkingSpinner({ text }: SpinnerProps) {
  const [currentMessage, setCurrentMessage] = useState(0);
  const blueGradient = gradient(['#0ea5e9', '#06b6d4']);
  useEffect(() => {
    if (text) return;
    const interval = setInterval(() => {
      setCurrentMessage(() => Math.floor(Math.random() * THINKING_MESSAGES.length));
    }, 2000);
    return () => clearInterval(interval);
  }, [text]);
  const displayText = text || THINKING_MESSAGES[currentMessage];
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">
          <InkSpinner type="dots" />
        </Text>
        <Text> {blueGradient(displayText)}</Text>
      </Box>
      <Box marginTop={0}>
        <Text dimColor>Press ESC to cancel</Text>
      </Box>
    </Box>
  );
}
