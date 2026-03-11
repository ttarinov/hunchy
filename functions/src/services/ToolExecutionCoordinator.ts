import { injectable } from "inversify";
import { ToolExecutionService } from "./ToolExecutionService";
import { FirebaseService } from "./FirebaseService";
import { ALL_TOOLS } from "../tools";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import type { ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
import { GitStatusResult, GitFile } from "../models/GitStatusResult";
import { ToolApprovalRequest } from "../models/ToolApprovalModel";

@injectable()
export class ToolExecutionCoordinator {
  constructor(
    private toolExecutionService: ToolExecutionService,
    private firebaseService: FirebaseService
  ) {}
  async executeToolWithRetry(
    tool: ToolUseBlock,
    userMessageId: string,
    maxRetries: number = 3
  ): Promise<unknown> {
    // Check if tool requires approval
    const toolDef = ALL_TOOLS.find(t => t.name === tool.name);
    const requiresApproval = toolDef?.requires_approval === true;

    if (requiresApproval) {
      console.log("Tool requires approval, requesting from CLI", { toolName: tool.name });
      const approved = await this.requestApproval(userMessageId, tool);
      if (!approved) {
        throw new Error(`User rejected ${tool.name} tool execution`);
      }
    }

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.toolExecutionService.requestToolExecution(
          userMessageId,
          tool.name,
          tool.input as Record<string, unknown>
        );
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }
    throw lastError || new Error('Tool execution failed after retries');
  }

  private async requestApproval(
    messageId: string,
    tool: ToolUseBlock,
    timeoutMs: number = 60000
  ): Promise<boolean> {
    const approvalsRef = this.firebaseService.database()
      .ref(`messages/${messageId}/toolApprovals`);
    const approvalRef = approvalsRef.push();
    const approvalId = approvalRef.key;

    const approvalRequest: ToolApprovalRequest = {
      toolName: tool.name,
      input: tool.input as Record<string, unknown>,
      timestamp: Date.now(),
      status: 'pending'
    };

    console.log("Creating tool approval request", { messageId, approvalId, toolName: tool.name });
    await approvalRef.set(approvalRequest);

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        unsubscribe();
        reject(new Error(`Tool approval timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      const unsubscribe = approvalRef.on('value', (snapshot) => {
        const approval = snapshot.val() as ToolApprovalRequest;

        if (approval.status === 'approved') {
          clearTimeout(timeout);
          unsubscribe();
          console.log("Tool approved by user", { toolName: tool.name });
          resolve(true);
        } else if (approval.status === 'rejected') {
          clearTimeout(timeout);
          unsubscribe();
          console.log("Tool rejected by user", { toolName: tool.name, reason: approval.rejectionReason });
          resolve(false);
        }
      });
    });
  }
  formatToolResult(tool: ToolUseBlock, result: unknown): ToolResultBlockParam {
    if (tool.name === 'git_status' && result && typeof result === 'object') {
      const statusResult = result as GitStatusResult;
      if (statusResult.files && Array.isArray(statusResult.files)) {
        const fileList = statusResult.files
          .map((f: GitFile) => `${f.status || '?'} ${f.path}`)
          .join('\n');
        const fileCount = statusResult.files.length;
        const filePaths = statusResult.files.map((f: GitFile) => f.path).join(', ');
        return {
          type: 'tool_result',
          tool_use_id: tool.id,
          content: JSON.stringify(result) + `\n\nIMPORTANT: git_status shows ${fileCount} changed file(s). You MUST include ALL of these files in your git_commit calls:\n${fileList}\n\nFile paths: ${filePaths}\n\nDo not skip any files. Create git_commit calls to cover all changed files.`
        };
      }
    } else if (tool.name === 'git_diff' && result) {
      return {
        type: 'tool_result',
        tool_use_id: tool.id,
        content: JSON.stringify(result) + `\n\nNow analyze these changes and call git_commit tool for each logical group of files. Remember: group by logical change, not by file count.`
      };
    } else if (tool.name === 'git_commit' && result) {
      return {
        type: 'tool_result',
        tool_use_id: tool.id,
        content: `Commit created successfully. ${JSON.stringify(result)}`
      };
    }
    const resultContent = result !== undefined && result !== null
      ? JSON.stringify(result)
      : 'Tool executed successfully (no result)';
    return {
      type: 'tool_result',
      tool_use_id: tool.id,
      content: resultContent
    };
  }
  formatToolError(tool: ToolUseBlock, error: unknown): ToolResultBlockParam {
    return {
      type: 'tool_result',
      tool_use_id: tool.id,
      content: error instanceof Error ? error.message : 'Tool execution failed',
      is_error: true
    };
  }
}
