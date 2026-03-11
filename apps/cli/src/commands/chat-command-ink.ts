import { Command } from "commander";
import chalk from "chalk";
import { startInkShell } from "../terminal/ink-shell.js";
import { ConfigManager } from "../auth/config-manager.js";
import { ApiClient } from "../auth/api-client.js";
import { DefaultClient } from "../client/default-client.js";
import { AuthTokenService } from "../services/auth-token-service.js";
async function startChatMode() {
  const apiClient = new ApiClient();
  try {
    const isAuthenticated = await apiClient.isAuthenticated();
    if (!isAuthenticated) {
      console.log(chalk.red("\n✗ Not authenticated"));
      console.log(chalk.gray("   Please run: ") + chalk.cyan("hunchy auth"));
      process.exit(1);
    }
    const configManager = apiClient.getConfigManager();
    const userEmail = await configManager.getUserEmail();
    const backendClient = apiClient.getBackendClient();
    if (!(backendClient instanceof DefaultClient)) {
      console.log(chalk.red("\n✗ Backend client not initialized"));
      process.exit(1);
    }
    await backendClient.initialize();
    const customToken = await configManager.getCustomToken();
    const authTokenService = new AuthTokenService(apiClient);
    try {
      const idToken = await authTokenService.getAuthTokenOrThrow();
      if (customToken && idToken) {
        await backendClient.authenticate(idToken, customToken);
      }
    } catch {
      console.log(chalk.red("\n✗ Not authenticated"));
      console.log(chalk.gray("   Please run: ") + chalk.cyan("hunchy auth"));
      process.exit(1);
    }
    await startInkShell({
      userEmail,
      onExit: () => {
        process.exit(0);
      }
    });
  } catch (error) {
    console.log(chalk.red("\n✗ Failed to start chat"));
    console.log(chalk.gray("Error: " + (error as Error).message));
    process.exit(1);
  }
}
export function createInkChatCommand(): Command {
  const chatCommand = new Command("chat");
  chatCommand.description("Start interactive chat with Hunchy (Ink UI)");
  chatCommand.option("-l, --local", "Use local Firebase emulators for development");
  chatCommand.action(async (options) => {
    if (options.local) {
      process.env.HUNCHY_USE_EMULATORS = "true";
      process.env.HUNCHY_LOCAL_MODE = "true";
      console.log(chalk.gray("🔧 Using local Firebase emulators\n"));
    }
    await startChatMode();
  });
  return chatCommand;
}
export async function runInkChat() {
  await startChatMode();
}
