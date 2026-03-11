import React from 'react';
import { Text } from 'ink';
interface StatusIconProps {
  type: 'success' | 'error' | 'warning' | 'info' | 'pending';
}
export function StatusIcon({ type }: StatusIconProps) {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
    pending: '○'
  };
  const colors = {
    success: 'green',
    error: 'red',
    warning: 'yellow',
    info: 'cyan',
    pending: 'gray'
  };
  return <Text color={colors[type]}>{icons[type]} </Text>;
}
