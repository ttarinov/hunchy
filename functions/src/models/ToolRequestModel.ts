export interface ToolRequestModel {
  status: 'pending' | 'executing' | 'completed' | 'error';
  tool: string;
  input: Record<string, unknown>;
  result?: unknown;
  error?: string;
  timestamp: number;
}
