export interface CliConfig {
  commands?: {
    customPath?: string;
  };
  analysis?: {
    ignorePatterns?: string[];
  };
}
export interface ConfigOptions {
  configPath?: string;
}
