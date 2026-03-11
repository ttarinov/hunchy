#!/usr/bin/env node
import { Command } from "commander";
import { readFileSync, existsSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { homedir } from "os";
import chalk from "chalk";
import { createAuthCommand, createLogoutCommand, createStatusCommand } from "./commands/auth-command.js";
import { createInkInitCommand, runInkInit } from "./commands/init-command-ink.js";
import { createInkChatCommand } from "./commands/chat-command-ink.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function checkForUpdateNotification() {
  try {
    const updateFlagPath = join(homedir(), '.hunchy', 'cache', 'update-available');
    if (existsSync(updateFlagPath)) {
      const newVersion = readFileSync(updateFlagPath, 'utf-8').trim();
      console.log(chalk.blue(`\nℹ  Update v${newVersion} downloaded. Will apply on next launch.\n`));
      unlinkSync(updateFlagPath);
    }
  } catch {
  }
}
function getVersion(): string {
  const locations = [
    join(__dirname, "package.json"),
    join(__dirname, "..", "package.json"),
    join(__dirname, "..", "..", "package.json")
  ];
  for (const location of locations) {
    try {
      const packageJson = JSON.parse(readFileSync(location, "utf-8"));
      return packageJson.version || "0.0.1";
    } catch {
      continue;
    }
  }
  return "0.0.1";
}
const version = getVersion();
const program = new Command();
program
  .name("hunchy")
  .description("AI-powered commit intelligence")
  .version(version)
  .option('--local', 'Run in local mode with emulators (no auth required)')
  .hook('preAction', (thisCommand) => {
    if (thisCommand.opts().local) {
      process.env.HUNCHY_USE_EMULATORS = 'true';
      process.env.HUNCHY_LOCAL_MODE = 'true';
    }
  });
program.addCommand(createAuthCommand());
program.addCommand(createLogoutCommand());
program.addCommand(createStatusCommand());
program.addCommand(createInkInitCommand());
program.addCommand(createInkChatCommand());
(async () => {
  checkForUpdateNotification();
  const args = process.argv.slice(2);
  const isBuiltInFlag = args.length > 0 && (
    args.includes('--help') ||
    args.includes('-h') ||
    args.includes('--version') ||
    args.includes('-V')
  );
  const hasCommand = args.some(arg => !arg.startsWith('-'));
  if (isBuiltInFlag || hasCommand) {
    program.parse();
  } else {
    if (args.includes('--local')) {
      process.env.HUNCHY_USE_EMULATORS = 'true';
      process.env.HUNCHY_LOCAL_MODE = 'true';
    }
    await runInkInit();
  }
})();
