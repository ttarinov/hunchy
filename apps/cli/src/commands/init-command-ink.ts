import { Command } from "commander";
import chalk from "chalk";
import { startInkShell } from "../terminal/ink-shell.js";
import { CommandRegistry } from "../core/command-registry.js";
import { ConfigLoader } from "../config/config-loader.js";
import { authCommand } from "./auth-command.js";
import { ConfigManager } from "../auth/config-manager.js";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function initializeHunchy() {
  const configLoader = new ConfigLoader();
  const config = await configLoader.load();
  const commandRegistry = new CommandRegistry(
    config.commands?.customPath || ".hunchy/commands"
  );
  try {
    await commandRegistry.loadCustomCommands();
  } catch (error) {
    console.warn("Failed to load custom commands:", error);
  }
  commandRegistry.register(authCommand);
  return { commandRegistry, configLoader };
}
async function startInkInteractive() {
  await initializeHunchy();
  const configManager = new ConfigManager();
  const userEmail = await configManager.getUserEmail();
  await startInkShell({
    userEmail,
    onExit: () => {
      process.exit(0);
    }
  });
}
export function createInkInitCommand(): Command {
  const initCommand = new Command("init");
  initCommand.description("Initialize Hunchy in your repository (Ink UI)");
  initCommand.action(async () => {
    console.log(chalk.cyan("🚀 Initializing Hunchy..."));
    console.log("");
    console.log(chalk.yellow("⚠️  Early access required"));
    console.log(
      chalk.gray("Visit ") +
        chalk.cyan("https://hunchy-4a0dc.web.app") +
        chalk.gray(" to apply for early access")
    );
    console.log("");
    console.log(
      chalk.gray("You can install the CLI now, but features require authentication.")
    );
    console.log("");
    console.log(chalk.gray("Starting interactive mode..."));
    console.log("");
    await sleep(1000);
    await startInkInteractive();
  });
  return initCommand;
}
export async function runInkInit() {
  try {
    await initializeHunchy();
    const configManager = new ConfigManager();
    const userEmail = await configManager.getUserEmail();
    await startInkShell({
      userEmail,
      onExit: () => {
        process.exit(0);
      }
    });
  } catch (error) {
    console.error(chalk.red('\n✗ Failed to start Hunchy'));
    console.error(chalk.gray('Error: '), error);
    process.exit(1);
  }
}
