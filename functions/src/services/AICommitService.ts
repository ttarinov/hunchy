import { injectable } from "inversify";
import { MessageService } from "./MessageService";
import { ToolExecutionService } from "./ToolExecutionService";
import { CommitWorkflowOrchestrator } from "./CommitWorkflowOrchestrator";
import { GitStatusResult, GitFile } from "../models/GitStatusResult";
@injectable()
export class AICommitService {
  constructor(
    private orchestrator: CommitWorkflowOrchestrator,
    private messageService: MessageService,
    private toolExecutionService: ToolExecutionService
  ) {}
  public isVerificationRequest(content: string): boolean {
    const lowerContent = content.toLowerCase().trim();
    return lowerContent === 'verify commits' || lowerContent.startsWith('verify commits');
  }
  public async processVerificationRequest(
    messageId: string,
    chatId: string,
    userId: string
  ): Promise<void> {
    console.log("Processing verification request", { messageId, chatId, userId });
    const agentMessageId = await this.messageService.createAgentMessage(
      chatId,
      userId,
      "Verifying commits...",
      "pending"
    );
    try {
      const gitStatusResult = await this.toolExecutionService.requestToolExecution(
        messageId,
        'git_status',
        {}
      );
      const statusResult = gitStatusResult as GitStatusResult;
      const remainingFiles = statusResult.files && Array.isArray(statusResult.files) 
        ? statusResult.files.map((f: GitFile) => f.path)
        : [];
      let content = '';
      if (remainingFiles.length === 0) {
        content = "✓ All files have been committed successfully. Working tree is clean.";
      } else {
        content = `⚠ ${remainingFiles.length} file(s) still uncommitted:\n${remainingFiles.map((f: string) => `- ${f}`).join('\n')}\n\nRun 'commit' again to commit remaining changes.`;
      }
      await this.messageService.updateMessageContent(agentMessageId, {
        content,
        status: 'completed',
        metadata: { toolCount: 1 }
      });
    } catch (error) {
      console.error("Error processing verification request", error);
      await this.messageService.updateMessageContent(agentMessageId, {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: "error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
  public async processCommitRequest(
    messageId: string,
    chatId: string,
    userId: string,
    userMessage: string
  ): Promise<void> {
    console.log("Processing commit request", { messageId, chatId, userId });
    const agentMessageId = await this.messageService.createAgentMessage(
      chatId,
      userId,
      "Analyzing your request...",
      "pending"
    );
    console.log("Agent message created", { agentMessageId });
    try {
      await this.orchestrator.runWorkflow(agentMessageId, messageId, userMessage, userId);
    } catch (error) {
      console.error("Error processing commit request", error);
      await this.messageService.updateMessageContent(agentMessageId, {
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: "error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
