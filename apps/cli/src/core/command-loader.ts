import fs from "fs-extra";
import path from "path";
import { glob } from "glob";
import type { CommandDefinition } from "../types/command.js";
export class CommandLoader {
  private commandsPath: string;
  constructor(commandsPath: string) {
    this.commandsPath = commandsPath;
  }
  async loadCommands(): Promise<CommandDefinition[]> {
    const commands: CommandDefinition[] = [];
    if (!(await fs.pathExists(this.commandsPath))) {
      return commands;
    }
    try {
      const commandFiles = await glob("**/*.{ts,js}", {
        cwd: this.commandsPath,
        absolute: true,
        ignore: ["**/*.d.ts", "**/node_modules/**"],
      });
      for (const filePath of commandFiles) {
        try {
          const module = await import(filePath);
          const command = module.default || module.command;
          if (this.isValidCommand(command)) {
            commands.push(command);
          } else if (Array.isArray(command)) {
            commands.push(...command.filter((c) => this.isValidCommand(c)));
          }
        } catch (error) {
          console.warn(`Failed to load command from ${filePath}:`, error);
        }
      }
    } catch (error) {
      console.warn(`Failed to scan commands directory ${this.commandsPath}:`, error);
    }
    return commands;
  }
  private isValidCommand(command: any): command is CommandDefinition {
    return (
      command &&
      typeof command === "object" &&
      typeof command.name === "string" &&
      typeof command.description === "string" &&
      typeof command.handler === "function"
    );
  }
}
