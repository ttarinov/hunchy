import type { CommandDefinition } from "../types/command.js";
import { CommandLoader } from "./command-loader.js";
export class CommandRegistry {
  private commands: Map<string, CommandDefinition> = new Map();
  private aliases: Map<string, string> = new Map();
  private loader: CommandLoader | null = null;
  constructor(commandsPath?: string) {
    if (commandsPath) {
      this.loader = new CommandLoader(commandsPath);
    }
  }
  register(command: CommandDefinition): void {
    if (this.commands.has(command.name)) {
      throw new Error(`Command "${command.name}" is already registered`);
    }
    this.commands.set(command.name, command);
    if (command.aliases) {
      for (const alias of command.aliases) {
        if (this.aliases.has(alias)) {
          throw new Error(`Alias "${alias}" is already registered`);
        }
        this.aliases.set(alias, command.name);
      }
    }
  }
  registerMany(commands: CommandDefinition[]): void {
    for (const command of commands) {
      this.register(command);
    }
  }
  async loadCustomCommands(): Promise<void> {
    if (!this.loader) {
      return;
    }
    const commands = await this.loader.loadCommands();
    this.registerMany(commands);
  }
  get(nameOrAlias: string): CommandDefinition | undefined {
    const commandName = this.aliases.get(nameOrAlias) || nameOrAlias;
    return this.commands.get(commandName);
  }
  has(nameOrAlias: string): boolean {
    const commandName = this.aliases.get(nameOrAlias) || nameOrAlias;
    return this.commands.has(commandName);
  }
  getAll(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }
  getAllNames(): string[] {
    return Array.from(this.commands.keys());
  }
  unregister(name: string): boolean {
    const command = this.commands.get(name);
    if (!command) {
      return false;
    }
    this.commands.delete(name);
    if (command.aliases) {
      for (const alias of command.aliases) {
        this.aliases.delete(alias);
      }
    }
    return true;
  }
  clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }
}
