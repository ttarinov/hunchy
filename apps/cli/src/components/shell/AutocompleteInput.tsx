import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import type { CommandDefinition } from '../../types/command.js';
interface AutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value: string) => void;
  suggestions: CommandDefinition[];
  maxSuggestions?: number;
}
export function AutocompleteInput({
  value,
  onChange,
  onSubmit,
  suggestions,
  maxSuggestions = 5,
}: AutocompleteInputProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const displaySuggestions = suggestions.slice(0, maxSuggestions);
  const hasSuggestions = displaySuggestions.length > 0 && value.startsWith('/');
  useEffect(() => {
    setShowSuggestions(hasSuggestions);
    setSelectedIndex(0);
  }, [value, hasSuggestions]);
  const handleSubmit = useCallback((inputValue: string) => {
    if (showSuggestions && selectedIndex >= 0 && selectedIndex < displaySuggestions.length) {
      const selectedCommand = displaySuggestions[selectedIndex];
      onSubmit(`/${selectedCommand.name}`);
      setShowSuggestions(false);
    } else {
      onSubmit(inputValue);
    }
  }, [onSubmit, showSuggestions, selectedIndex, displaySuggestions]);
  useInput(
    (input, key) => {
      if ((key.meta || key.ctrl) && (key.backspace || key.delete)) {
        onChange('');
        return;
      }
      if (showSuggestions) {
        if (key.upArrow) {
          setSelectedIndex(prev => (prev > 0 ? prev - 1 : displaySuggestions.length - 1));
        } else if (key.downArrow) {
          setSelectedIndex(prev => (prev < displaySuggestions.length - 1 ? prev + 1 : 0));
        } else if (key.tab && !key.shift) {
          if (selectedIndex >= 0 && selectedIndex < displaySuggestions.length) {
            const selectedCommand = displaySuggestions[selectedIndex];
            onChange(`/${selectedCommand.name} `);
            setShowSuggestions(false);
          }
        }
      }
    },
    { isActive: true }
  );
  return (
    <Box flexDirection="column">
      <Box>
        <Text color="cyan">&gt; </Text>
        <TextInput
          value={value}
          onChange={onChange}
          onSubmit={handleSubmit}
        />
      </Box>
      {showSuggestions && displaySuggestions.length > 0 && (
        <Box flexDirection="column" marginTop={1}>
          {displaySuggestions.map((cmd, index) => (
            <Box key={cmd.name}>
              <Text color={index === selectedIndex ? 'cyan' : 'gray'}>
                {index === selectedIndex ? '▶ ' : '  '}
              </Text>
              <Text color={index === selectedIndex ? 'cyan' : 'white'}>
                /{cmd.name}
              </Text>
              <Text dimColor> - {cmd.description}</Text>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
