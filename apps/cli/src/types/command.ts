export interface OptionDefinition {
  flags: string;
  description: string;
  defaultValue?: any;
  required?: boolean;
}
export interface CommandDefinition {
  name: string;
  description: string;
  aliases?: string[];
  options?: OptionDefinition[];
  handler: (args: string[], options: Record<string, any>) => Promise<any> | any;
}
export interface CommandContext {
  args: string[];
  options: Record<string, any>;
  cwd: string;
}
