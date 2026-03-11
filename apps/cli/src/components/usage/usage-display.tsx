import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
interface UsageData {
  tokensUsed: number;
  tokensLimit: number;
  requestsCount: number;
  day: string;
  plan: string;
  resetsAt: number;
}
interface UsageDisplayProps {
  usageData: UsageData | null;
  isLoading?: boolean;
  onExit: () => void;
}
function getResetTime(resetsAt: number): string {
  try {
    const now = Date.now();
    const msUntil = resetsAt - now;
    const hoursUntil = Math.floor(msUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((msUntil % (1000 * 60 * 60)) / (1000 * 60));
    if (hoursUntil > 0) {
      return `Resets in ${hoursUntil}h ${minutesUntil}m`;
    }
    return `Resets in ${minutesUntil}m`;
  } catch {
    return 'Resets at midnight UTC';
  }
}
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(0)}K`;
  }
  return tokens.toString();
}
function ProgressBar({ used, total, label, color = 'blue', resetTime }: { used: string; total: string | null; label: string; color?: string; resetTime?: string }) {
  if (total === null) {
    return (
      <Box flexDirection="column" marginY={1}>
        <Box>
          <Text>{label}</Text>
        </Box>
        <Box>
          <Text color={color}>{used}</Text> / <Text dimColor>Unlimited</Text>
        </Box>
        {resetTime && (
          <Box marginTop={0}>
            <Text dimColor>{resetTime}</Text>
          </Box>
        )}
      </Box>
    );
  }
  const parseTokens = (str: string): number => {
    if (str.endsWith('M')) return parseFloat(str) * 1000000;
    if (str.endsWith('K')) return parseFloat(str) * 1000;
    return parseFloat(str);
  };
  const usedNum = parseTokens(used);
  const totalNum = parseTokens(total);
  const percentage = (usedNum / totalNum) * 100;
  const barWidth = 50;
  const filledBlocks = Math.min(Math.floor((percentage / 100) * barWidth), barWidth);
  const hasPartial = (percentage / 100) * barWidth > filledBlocks && filledBlocks < barWidth;
  const empty = Math.max(0, barWidth - filledBlocks - (hasPartial ? 1 : 0));
  const bar = '█'.repeat(filledBlocks) + (hasPartial ? '▌' : '') + '░'.repeat(empty);
  const countText = `${used}/${total}`;
  const percentageText = `${Math.round(percentage)}%`;
  const remaining = formatTokens(totalNum - usedNum);
  return (
    <Box flexDirection="column" marginY={1}>
      <Box>
        <Text>{label}</Text>
      </Box>
      <Box>
        <Text color={color}>{bar}</Text>
        <Text>   {countText} ({percentageText})</Text>
      </Box>
      {usedNum < totalNum && (
        <Box marginTop={0}>
          <Text dimColor>{remaining} remaining</Text>
        </Box>
      )}
      {resetTime && (
        <Box marginTop={0}>
          <Text dimColor>{resetTime}</Text>
        </Box>
      )}
    </Box>
  );
}
export function UsageDisplay({ usageData, isLoading, onExit }: UsageDisplayProps) {
  const [isActive, setIsActive] = useState(true);
  useInput((input, key) => {
    if (key.escape) {
      setIsActive(false);
      onExit();
    }
  }, { isActive });
  const separatorLine = '─'.repeat(100);
  if (isLoading || !usageData) {
    return (
      <Box flexDirection="column">
        <Text>{separatorLine}</Text>
        <Text>{separatorLine}</Text>
        <Box marginTop={1}>
          <Text color="gray">Loading usage data...</Text>
        </Box>
        <Box marginTop={2}>
          <Text dimColor>escape to cancel</Text>
        </Box>
      </Box>
    );
  }
  const resetTime = getResetTime(usageData.resetsAt);
  const planName = usageData.plan.charAt(0).toUpperCase() + usageData.plan.slice(1);
  const isUnlimited = usageData.tokensLimit === Infinity || usageData.tokensLimit === 0;
  return (
    <Box flexDirection="column">
      <Text>{separatorLine}</Text>
      <Text>{separatorLine}</Text>
      <Box marginTop={1} flexDirection="column">
        <Box marginBottom={1}>
          <Text>Plan: <Text color="cyan" bold>{planName}</Text></Text>
        </Box>
        <ProgressBar
          used={formatTokens(usageData.tokensUsed)}
          total={isUnlimited ? null : formatTokens(usageData.tokensLimit)}
          label="Tokens (Daily Limit)"
          color="blue"
          resetTime={resetTime}
        />
        <Box marginTop={1}>
          <Text dimColor>Requests today: {usageData.requestsCount}</Text>
        </Box>
      </Box>
      <Box marginTop={2}>
        <Text dimColor>escape to cancel</Text>
      </Box>
    </Box>
  );
}
