import { useMemo } from 'react';
import { authCommand, logoutCommand, helpCommand } from '../commands/auth-command.js';
import { usageCommand } from '../commands/usage-command.js';
import type { CommandDefinition } from '../types/command.js';
export function useCommands() {
  const commands = useMemo<CommandDefinition[]>(() => {
    return [authCommand, logoutCommand, helpCommand, usageCommand];
  }, []);
  const getCommand = (name: string): CommandDefinition | undefined => {
    return commands.find(cmd => cmd.name === name || cmd.aliases?.includes(name));
  };
  const getSuggestions = (input: string): CommandDefinition[] => {
    if (!input.startsWith('/')) {
      return [];
    }
    const query = input.slice(1).toLowerCase();
    if (!query) {
      return commands;
    }
    return commands.filter(cmd => {
      const nameMatch = cmd.name.toLowerCase().startsWith(query);
      const aliasMatch = cmd.aliases?.some(alias => alias.toLowerCase().startsWith(query));
      return nameMatch || aliasMatch;
    });
  };
  return {
    commands,
    getCommand,
    getSuggestions,
  };
}
