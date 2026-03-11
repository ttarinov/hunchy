import type { ToolHandler, ToolResult } from '../types/tool.js';
import { GitService } from './git-service.js';
import { createGitTools } from './tools/git-tools.js';
import { createFilesystemTools } from './tools/filesystem-tools.js';
import { getErrorMessage } from '../utils/error-utils.js';
export class ToolRegistry {
  private tools = new Map<string, ToolHandler>();
  private gitService: GitService;
  constructor(repoPath?: string) {
    this.gitService = new GitService(repoPath);
    this.registerDefaultTools();
  }
  private registerDefaultTools(): void {
    const gitTools = createGitTools(this.gitService);
    const filesystemTools = createFilesystemTools();
    for (const [name, handler] of gitTools) {
      this.tools.set(name, handler);
    }
    for (const [name, handler] of filesystemTools) {
      this.tools.set(name, handler);
    }
  }
  register(name: string, handler: ToolHandler): void {
    this.tools.set(name, handler);
  }
  async execute(name: string, input: Record<string, unknown>): Promise<ToolResult> {
    const handler = this.tools.get(name);
    if (!handler) {
      return {
        success: false,
        error: `Tool not found: ${name}`
      };
    }
    try {
      return await handler(input || {});
    } catch (error) {
      return {
        success: false,
        error: getErrorMessage(error)
      };
    }
  }
  has(name: string): boolean {
    return this.tools.has(name);
  }
  getRegisteredTools(): string[] {
    return Array.from(this.tools.keys());
  }
}
