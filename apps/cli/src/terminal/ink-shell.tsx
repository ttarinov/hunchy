import React from 'react';
import { render } from 'ink';
import { AppWithShell } from '../components/app-with-shell.js';
interface InkShellConfig {
  userEmail?: string;
  onExit?: () => void;
}
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function startInkShell(config: InkShellConfig = {}): Promise<void> {
  if (!process.stdin.isTTY) {
    console.error('Error: Interactive mode requires a TTY terminal');
    console.error('Please run this command directly in your terminal, not through a pipe or redirect');
    process.exit(1);
  }
  process.env.HUNCHY_INTERACTIVE_MODE = 'true';
  process.stdout.write('\x1b[2J\x1b[3J\x1b[H');
  await sleep(100);
  const { waitUntilExit } = render(
    <AppWithShell
      userEmail={config.userEmail}
      onExit={config.onExit}
    />,
    {
      stdin: process.stdin,
      stdout: process.stdout,
      stderr: process.stderr,
    }
  );
  await waitUntilExit();
}
