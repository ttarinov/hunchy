import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import type { CliConfig, ConfigOptions } from "../types/config.js";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DEFAULT_CONFIG: CliConfig = {
  commands: {
    customPath: ".hunchy/commands",
  },
  analysis: {
    ignorePatterns: ["node_modules", ".git", "dist", "build", ".next"],
  },
};
export class ConfigLoader {
  private configPath: string;
  private config: CliConfig;
  constructor(options: ConfigOptions = {}) {
    const cwd = process.cwd();
    this.configPath = options.configPath || path.join(cwd, ".hunchy", "config.json");
    this.config = { ...DEFAULT_CONFIG };
  }
  async load(): Promise<CliConfig> {
    try {
      if (await fs.pathExists(this.configPath)) {
        const fileContent = await fs.readJson(this.configPath);
        this.config = {
          ...DEFAULT_CONFIG,
          ...fileContent,
          commands: {
            ...DEFAULT_CONFIG.commands,
            ...fileContent.commands,
          },
          analysis: {
            ...DEFAULT_CONFIG.analysis,
            ...fileContent.analysis,
          },
        };
      }
    } catch (error) {
      console.warn(`Failed to load config from ${this.configPath}:`, error);
    }
    return this.config;
  }
  async save(config: CliConfig): Promise<void> {
    try {
      await fs.ensureDir(path.dirname(this.configPath));
      await fs.writeJson(this.configPath, config, { spaces: 2 });
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save config to ${this.configPath}: ${error}`);
    }
  }
  getConfig(): CliConfig {
    return this.config;
  }
  getConfigPath(): string {
    return this.configPath;
  }
}
