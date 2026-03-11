import React from 'react';
import { Box, Text } from 'ink';
import gradient from 'gradient-string';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { getTerminalWidth } from '../../utils/terminal.js';
interface WelcomeScreenProps {
  userEmail?: string;
}
function getVersion(): string {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const locations = [
    join(__dirname, 'package.json'),
    join(__dirname, '..', 'package.json'),
    join(__dirname, '..', '..', 'package.json'),
    join(__dirname, '..', '..', '..', 'package.json')
  ];
  for (const location of locations) {
    try {
      const packageJson = JSON.parse(readFileSync(location, 'utf-8'));
      return packageJson.version || '0.0.1';
    } catch {
      continue;
    }
  }
  return '0.0.1';
}
export function WelcomeScreen({ userEmail }: WelcomeScreenProps) {
  const version = getVersion();
  const isLocalMode = process.env.HUNCHY_LOCAL_MODE === 'true';
  const workspacePath = process.cwd();
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  const displayPath = workspacePath.startsWith(homeDir)
    ? workspacePath.replace(homeDir, '~')
    : workspacePath;
  const blueGradient = gradient(['#0ea5e9', '#06b6d4']);
  const logo = `█ █ █ █ █▄ █ ▄▀▀ █ █ █▄█
█▀█ █▄█ █ ▀█ ▀▄▄ █▀█  █`;
  const terminalWidth = getTerminalWidth();
  const boxWidth = Math.min(terminalWidth - 2, 120); 
  const modeIndicator = isLocalMode ? ' [LOCAL DEV]' : '';
  const title = `Hunchy CLI v${version}${modeIndicator}`;
  const titleSection = `─── ${title} `;
  const remainingWidth = Math.max(1, boxWidth - titleSection.length - 1);
  const headerLineRaw = `╭${titleSection}${'─'.repeat(remainingWidth)}╮`;
  const headerLine = isLocalMode
    ? gradient(['#f59e0b', '#eab308'])(headerLineRaw)  
    : blueGradient(headerLineRaw);                      
  const leftColumnWidth = Math.floor((boxWidth - 3) / 2); 
  const rightColumnWidth = boxWidth - leftColumnWidth - 3;
  const welcomeText = userEmail 
    ? `Welcome back ${userEmail.split('@')[0]}!`
    : 'Welcome!';
  const logoLines = logo.split('\n');
  const createHorizontalLine = (leftChar: string, rightChar: string, fillChar: string = '─') => {
    const fillWidth = Math.max(0, boxWidth - 2);
    return `${leftChar}${fillChar.repeat(fillWidth)}${rightChar}`;
  };
  const bottomLineRaw = createHorizontalLine('╰', '╯');
  const bottomLine = blueGradient(bottomLineRaw);
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  };
  return (
    <Box flexDirection="column" marginBottom={1}>
      {}
      <Text>{headerLine}</Text>
      {}
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1} paddingTop={1}>
          <Text>{welcomeText}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1} paddingTop={1}>
          <Text>{blueGradient('Tips for getting started')}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1}>
          <Text>{' '}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1}>
          <Text>{' '}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1}>
          <Text>{blueGradient(logoLines[0] || '')}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1}>
          <Text dimColor>• Type /help for available commands</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1}>
          <Text>{blueGradient(logoLines[1] || '')}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1}>
          <Text dimColor>• Type a message to start chatting</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1}>
          <Text>{' '}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1}>
          <Text dimColor>• Press Ctrl+C to exit</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1}>
          {userEmail && <Text dimColor>{truncateText(userEmail, leftColumnWidth - 2)}</Text>}
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1}>
          <Text>{' '}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1}>
          <Text dimColor>{truncateText(displayPath, leftColumnWidth - 2)}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1}>
          <Text>{blueGradient('Recent activity')}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      <Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={leftColumnWidth} paddingX={1}>
          <Text>{' '}</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
        <Box width={rightColumnWidth} paddingX={1}>
          <Text dimColor>No recent activity</Text>
        </Box>
        <Text>{blueGradient('│')}</Text>
      </Box>
      {}
      <Text>{bottomLine}</Text>
    </Box>
  );
}
