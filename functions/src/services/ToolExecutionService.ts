import { injectable } from "inversify";
import { FirebaseService } from "./FirebaseService";
import { ToolRequestModel } from "../models/ToolRequestModel";
import { ALL_TOOLS, AGENT_ALLOWED_TOOLS } from "../tools";
export interface ToolDefinition {
  name: string;
  description: string;
  input_schema: {
    type: "object";
    properties: Record<string, {
      type: string;
      description: string;
      default?: unknown;
      enum?: string[];
      items?: { type: string };
    }>;
    required?: string[];
  };
  requires_approval?: boolean;
}
@injectable()
export class ToolExecutionService {
  constructor(
    private firebaseService: FirebaseService
  ) {}
  public defineTools(): ToolDefinition[] {
    return ALL_TOOLS;
  }
  public getAllowedTools(): ToolDefinition[] {
    return ALL_TOOLS.filter(tool => 
      AGENT_ALLOWED_TOOLS.includes(tool.name)
    );
  }
  public async requestToolExecution(
    messageId: string,
    toolName: string,
    input: Record<string, unknown>,
    timeoutMs: number = 30000
  ): Promise<unknown> {
    const toolRequestsRef = this.firebaseService.database()
      .ref(`messages/${messageId}/toolRequests`);
    const requestRef = toolRequestsRef.push();
    const toolRequestId = requestRef.key;
    const toolRequest: ToolRequestModel = {
      status: 'pending',
      tool: toolName,
      input: input,
      timestamp: Date.now()
    };
    console.log("Creating tool request", { messageId, toolRequestId, toolName, input });
    await requestRef.set(toolRequest);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        requestRef.off('value', listener);
        console.error("Tool execution timeout", { messageId, toolRequestId, toolName, timeoutMs });
        reject(new Error(`Tool execution timeout: ${toolName}`));
      }, timeoutMs);
      const listener = requestRef.on('value', (snapshot) => {
        const data = snapshot.val() as ToolRequestModel;
        if (!data) {
          console.log("Tool request data not yet available", { messageId, toolRequestId });
          return;
        }
        console.log("Tool request status update", { messageId, toolRequestId, status: data.status });
        if (data.status === 'completed') {
          clearTimeout(timeout);
          requestRef.off('value', listener);
          console.log("Tool execution completed", { messageId, toolRequestId, toolName });
          resolve(data.result);
        } else if (data.status === 'error') {
          clearTimeout(timeout);
          requestRef.off('value', listener);
          console.error("Tool execution error", { messageId, toolRequestId, toolName, error: data.error });
          reject(new Error(data.error || 'Tool execution error'));
        }
      });
    });
  }
}
