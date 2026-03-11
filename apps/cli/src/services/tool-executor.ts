import type { ToolResult } from '../types/tool.js';
import { ToolRegistry } from './tool-registry.js';
export class ToolExecutor {
  private registry: ToolRegistry;
  constructor(repoPath?: string) {
    this.registry = new ToolRegistry(repoPath);
  }
  async executeTool(toolName: string, input: Record<string, unknown>): Promise<ToolResult> {
    return await this.registry.execute(toolName, input || {});
  }
}
