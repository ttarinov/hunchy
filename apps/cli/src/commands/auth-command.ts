import { Command } from "commander";
import chalk from "chalk";
import open from "open";
import ora from "ora";
import { ApiClient } from "../auth/api-client.js";
import { AuthError, BackendError, ConfigError, TimeoutError } from "../utils/errors.js";
import type { CommandDefinition } from "../types/command.js";
import { clearScreen } from "../utils/terminal.js";
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
export async function performAuth(silent: boolean = false): Promise<any> {
  const apiClient = new ApiClient();
  if (!silent) {
    console.log(chalk.cyan("\n🔐 Starting browser authentication...\n"));
  }
  const deviceAuth = await apiClient.startDeviceAuth();
  const authUrl = `${deviceAuth.verificationUri}?device_code=${deviceAuth.deviceCode}`;
  if (!silent) {
    console.log(chalk.white("1. Opening browser for authentication..."));
  }
  try {
    await open(authUrl);
    if (!silent) {
      console.log(chalk.green("   ✓ Browser opened\n"));
    }
  } catch (error) {
    if (!silent) {
      console.log(chalk.yellow("   ⚠️  Could not open browser automatically"));
      console.log(chalk.gray("   Please visit: ") + chalk.cyan(authUrl) + "\n");
    }
  }
  if (!silent) {
    console.log(chalk.white("2. Waiting for authentication..."));
    console.log(chalk.gray("   Complete the authentication in your browser\n"));
  }
  let spinner;
  if (!silent) {
    spinner = ora({
      text: "Waiting for authentication...",
      spinner: "dots",
    }).start();
  }
  try {
    const tokenResponse = await apiClient.pollForToken(
      deviceAuth.deviceCode,
      deviceAuth.interval
    );
    if (spinner) {
      spinner.stop();
    }
    if (!silent) {
      console.log(chalk.green("   ✓ Authentication successful\n"));
    }
    if (tokenResponse.email) {
      await apiClient.getConfigManager().setUserEmail(tokenResponse.email);
    }
    await apiClient.setTokens(tokenResponse);
    await apiClient.initialize();
    const backendClient = apiClient.getBackendClient();
    const actualIdToken = await backendClient.authenticate(tokenResponse.idToken, tokenResponse.customToken);
    await apiClient.getConfigManager().setAuthToken(actualIdToken);
    if (!silent) {
      console.log(chalk.green("✓ ") + chalk.white("You are now authenticated!"));
      console.log(chalk.gray("   Email: ") + chalk.cyan(tokenResponse.email || "N/A"));
      console.log(chalk.gray("   User ID: ") + chalk.cyan(tokenResponse.userId));
      console.log("");
    }
    return tokenResponse;
  } catch (error) {
    if (spinner) {
      spinner.stop();
    }
    if (!silent) {
      if (error instanceof TimeoutError) {
        console.log(chalk.red("   ✗ Authentication timed out"));
        console.log(chalk.gray("   Error: " + error.message));
      } else if (error instanceof AuthError) {
        console.log(chalk.red("   ✗ Authentication failed"));
        console.log(chalk.gray("   Error: " + error.message));
      } else {
        console.log(chalk.red("   ✗ Authentication failed or timed out"));
        console.log(chalk.gray("   Error: " + (error as Error).message));
      }
      console.log(chalk.gray("\n   Please try again: ") + chalk.cyan("hunchy auth"));
    }
    throw error;
  }
}
export function createAuthCommand(): Command {
  const authCommand = new Command("auth");
  authCommand.description("Authenticate with Hunchy via browser");
  authCommand.option("-l, --local", "Use local Firebase emulators for development");
  authCommand.action(async (options) => {
    if (options.local) {
      process.env.HUNCHY_USE_EMULATORS = "true";
      console.log(chalk.gray("🔧 Using local Firebase emulators\n"));
    }
    try {
      await performAuth();
    } catch (error) {
      if (error instanceof ConfigError) {
        console.log(chalk.red("\n✗ Failed to start authentication"));
        console.log(chalk.gray("Error: " + error.message));
        console.log(chalk.gray("\nPlease ensure you have the correct backend configuration."));
        console.log(chalk.gray("If this is your first time, visit ") + chalk.cyan("https://hunchy-4a0dc.web.app") + chalk.gray(" to get started."));
      } else if (error instanceof BackendError) {
        console.log(chalk.red("\n✗ Failed to start authentication"));
        console.log(chalk.gray("Error: " + error.message));
        console.log(chalk.gray("\nPlease check your internet connection and try again."));
      } else if (!(error instanceof AuthError) && !(error instanceof TimeoutError)) {
        console.log(chalk.red("\n✗ Failed to start authentication"));
        const errorMessage = (error as Error).message;
        console.log(chalk.gray("Error: " + errorMessage));
        console.log(chalk.gray("\nPlease check your internet connection and try again."));
      }
      if (!process.env.HUNCHY_INTERACTIVE_MODE) {
        process.exit(1);
      }
    }
  });
  return authCommand;
}
export const authCommand: CommandDefinition = {
  name: "auth",
  description: "Authenticate with Hunchy via browser",
  handler: async (_args: string[], _options: Record<string, any>) => {
    const isInteractive = process.env.HUNCHY_INTERACTIVE_MODE === 'true';
    if (isInteractive) {
      clearScreen();
      await sleep(100);
    }
    try {
      const tokenResponse = await performAuth(isInteractive);
      if (isInteractive) {
        await sleep(100);
        clearScreen();
      }
      return {
        success: true,
        message: "Authentication successful",
        email: tokenResponse.email,
        userId: tokenResponse.userId
      };
    } catch (error) {
      let errorMessage = "Failed to start authentication";
      let errorDetails = (error as Error).message;
      let hint = "";
      if (error instanceof ConfigError) {
        hint = "Please ensure you have the correct backend configuration. If this is your first time, visit https://hunchy-4a0dc.web.app to get started.";
      } else if (error instanceof BackendError) {
        hint = "Please check your internet connection and try again.";
      } else if (!(error instanceof AuthError) && !(error instanceof TimeoutError)) {
        hint = "Please check your internet connection and try again.";
      }
      return {
        success: false,
        message: errorMessage,
        error: errorDetails,
        hint
      };
    }
  },
};
export function createLogoutCommand(): Command {
  const logoutCommand = new Command("logout");
  logoutCommand.description("Remove your credentials and logout");
  logoutCommand.action(async () => {
    try {
      const apiClient = new ApiClient();
      await apiClient.logout();
      console.log(chalk.green("✓ ") + chalk.white("Logged out successfully"));
      process.exit(0);
    } catch (error) {
      console.log(chalk.red("✗ ") + chalk.white("Failed to logout"));
      console.log(chalk.gray("Error: " + (error as Error).message));
      process.exit(1);
    }
  });
  return logoutCommand;
}
export function createStatusCommand(): Command {
  const statusCommand = new Command("status");
  statusCommand.description("Check authentication status");
  statusCommand.action(async () => {
    try {
      const apiClient = new ApiClient();
      const isAuthenticated = await apiClient.isAuthenticated();
      if (isAuthenticated) {
        const configPath = apiClient.getConfigManager().getConfigPath();
        console.log(chalk.green("✓ ") + chalk.white("Authenticated"));
        console.log(chalk.gray("Config: " + configPath));
        const backendClient = apiClient.getBackendClient();
        try {
          const isBackendAvailable = await backendClient.isAvailable();
          if (isBackendAvailable) {
            console.log(chalk.green("✓ ") + chalk.white("Backend available"));
          } else {
            console.log(chalk.yellow("⚠️  Backend configuration incomplete"));
            console.log(chalk.gray("Run: ") + chalk.cyan("hunchy auth") + chalk.gray(" to update configuration"));
          }
        } catch {
          console.log(chalk.yellow("⚠️  Could not check backend availability"));
        }
        process.exit(0);
      } else {
        console.log(chalk.yellow("⚠️  Not authenticated"));
        console.log(chalk.gray("Run: ") + chalk.cyan("hunchy auth"));
        process.exit(1);
      }
    } catch (error) {
      console.log(chalk.red("✗ ") + chalk.white("Failed to check status"));
      console.log(chalk.gray("Error: " + (error as Error).message));
      process.exit(1);
    }
  });
  return statusCommand;
}
export const logoutCommand: CommandDefinition = {
  name: "logout",
  description: "Remove your credentials and logout",
  handler: async (_args: string[], _options: Record<string, any>) => {
    try {
      const apiClient = new ApiClient();
      await apiClient.logout();
      return {
        success: true,
        message: "Logged out successfully"
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to logout",
        error: (error as Error).message
      };
    }
  },
};
export const helpCommand: CommandDefinition = {
  name: "help",
  description: "Show available commands",
  handler: async (_args: string[], _options: Record<string, any>) => {
    return {
      success: true,
      commands: [
        { name: "/auth", description: "Authenticate with Hunchy via browser" },
        { name: "/logout", description: "Remove your credentials and logout" },
        { name: "/help", description: "Show this help message" }
      ]
    };
  },
};
