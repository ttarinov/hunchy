import type { ToolRequestStatus } from './enums.js';
export { ToolRequestStatus } from './enums.js';
export interface ToolRequest {
  status: ToolRequestStatus;
  tool: string;
  input: Record<string, unknown>;
  result?: unknown;
  error?: string;
  timestamp: number;
}
export interface ToolResult {
  success: boolean;
  result?: unknown;
  error?: string;
}
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, {
      type: string;
      description: string;
      default?: unknown;
    }>;
    required?: string[];
  };
}
export type ToolHandler = (input: Record<string, unknown>) => Promise<ToolResult>;
