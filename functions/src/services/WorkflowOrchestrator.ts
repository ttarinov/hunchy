import { injectable } from "inversify";
import { AnthropicClient, ContentBlock } from "../clients/AnthropicClient";
import { ToolExecutionService } from "./ToolExecutionService";
import { MessageService } from "./MessageService";
import { PromptBuilderService, WorkflowState } from "./PromptBuilderService";
import { UsageTrackingService } from "./UsageTrackingService";
import { ToolExecutionCoordinator } from "./ToolExecutionCoordinator";
import { WorkflowStateManager } from "./WorkflowStateManager";
import { CollapsibleSection, MessageMetadata } from "../models/CollapsibleSectionModel";
import type { MessageParam, ToolResultBlockParam } from "@anthropic-ai/sdk/resources/messages";
import type { ToolUseBlock } from "@anthropic-ai/sdk/resources/messages";
import { GitStatusResult, GitFile } from "../models/GitStatusResult";
const MAX_ITERATIONS = 20;
@injectable()
export class CommitWorkflowOrchestrator {
  constructor(
    private anthropicClient: AnthropicClient,
    private toolExecutionService: ToolExecutionService,
    private messageService: MessageService,
    private promptBuilder: PromptBuilderService,
    private usageTrackingService: UsageTrackingService,
    private toolCoordinator: ToolExecutionCoordinator,
    private stateManager: WorkflowStateManager
  ) {
    this.stateManager.setState(this.promptBuilder.getInitialState());
  }
  async runWorkflow(
    agentMessageId: string,
    userMessageId: string,
    userMessage: string,
    userId?: string
  ): Promise<void> {
    const sections: CollapsibleSection[] = [];
    let conversationMessages: MessageParam[] = [{
      role: 'user',
      content: userMessage
    }];
    const tools = this.toolExecutionService.getAllowedTools();
    let toolCount = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let allChangedFiles: Set<string> = new Set();
    let iterationCount = 0;
    this.stateManager.setState(this.promptBuilder.getInitialState());
    while (iterationCount < MAX_ITERATIONS) {
      iterationCount++;
      console.log("Calling AI with", conversationMessages.length, "messages", "iteration", iterationCount);
      conversationMessages = this.stateManager.pruneConversationHistory(conversationMessages);
      const hasToolResults = conversationMessages.some(m => 
        m.role === 'user' && 
        Array.isArray(m.content) && 
        m.content.some((c): c is ToolResultBlockParam => c.type === 'tool_result')
      );
      const currentState = this.promptBuilder.determineState(hasToolResults, false);
      this.stateManager.setState(currentState);
      const systemPrompt = this.promptBuilder.buildPrompt(currentState);
      let fullText = '';
      let contentBlocks: ContentBlock[] = [];
      let thinkingContent = '';
      const callbacks = {
        onThinkingStart: () => { thinkingContent = ''; },
        onThinkingDelta: (delta: string) => { thinkingContent += delta; },
        onThinkingEnd: () => {},
        onTextDelta: (delta: string) => { fullText += delta; },
        onTextComplete: (text: string) => { fullText = text; },
        onToolUse: (tool: ToolUseBlock) => { contentBlocks.push(tool); }
      };
      const result = await this.anthropicClient.streamMessage(
        systemPrompt,
        conversationMessages,
        tools,
        callbacks
      );
      if (result.usage) {
        totalInputTokens += result.usage.input_tokens;
        totalOutputTokens += result.usage.output_tokens;
      }
      contentBlocks = result.contentBlocks;
      console.log("AI completed with text", { content: fullText.substring(0, 200) + '...' });
      if (contentBlocks.length === 0 && fullText) {
        // AI responded with text only (no tool calls) - this means it's done or declining
        this.stateManager.setState(WorkflowState.COMPLETED);
        await this.finishWorkflow(agentMessageId, sections, fullText, toolCount, totalInputTokens, totalOutputTokens, thinkingContent, userId, iterationCount);
        console.log("Workflow completed with text response", { iterationCount });
        return;
      }
      if (contentBlocks.length > 0) {
        const toolUseBlocks = contentBlocks.filter((cb): cb is ToolUseBlock => cb.type === 'tool_use');
        if (toolUseBlocks.length === 0 && fullText && fullText.trim().length > 0) {
          // AI returned content blocks but no tool use, just text - workflow is done
          this.stateManager.setState(WorkflowState.COMPLETED);
          await this.finishWorkflow(agentMessageId, sections, fullText, toolCount, totalInputTokens, totalOutputTokens, thinkingContent, userId, iterationCount);
          console.log("Workflow completed with text response", { iterationCount });
          return;
        }
        if (toolUseBlocks.length === 0) {
          console.warn("AI returned content blocks but no tool use and no text, skipping");
          continue;
        }
        conversationMessages.push({ role: 'assistant', content: contentBlocks });
        const toolResults = await this.executeTools(
          toolUseBlocks,
          userMessageId,
          agentMessageId,
          sections,
          allChangedFiles,
          toolCount,
          totalInputTokens,
          totalOutputTokens,
          thinkingContent
        );
        toolCount += toolUseBlocks.length;
        const allResultsValid = toolResults.length > 0 && toolResults.every(tr => {
          if (typeof tr.content === 'string') {
            return tr.content.trim().length > 0;
          }
          return Array.isArray(tr.content) && tr.content.length > 0;
        });
        if (allResultsValid) {
          conversationMessages.push({ role: 'user', content: toolResults });
          this.stateManager.setState(WorkflowState.ANALYZING);
        } else {
          console.error("Cannot continue: tool results are empty or have empty content", { toolResults });
          break;
        }
      } else {
        console.error("AI returned nothing");
        this.stateManager.setState(WorkflowState.ERROR);
        break;
      }
    }
    if (iterationCount >= MAX_ITERATIONS) {
      await this.finishWorkflow(
        agentMessageId,
        sections,
        "Maximum iterations reached. Please try again with a more specific request.",
        toolCount,
        totalInputTokens,
        totalOutputTokens,
        undefined,
        userId,
        iterationCount,
        'error'
      );
      this.stateManager.setState(WorkflowState.ERROR);
    }
  }
  private async executeTools(
    toolUseBlocks: ToolUseBlock[],
    userMessageId: string,
    agentMessageId: string,
    sections: CollapsibleSection[],
    allChangedFiles: Set<string>,
    toolCount: number,
    totalInputTokens: number,
    totalOutputTokens: number,
    thinkingContent: string
  ): Promise<ToolResultBlockParam[]> {
    const toolResults: ToolResultBlockParam[] = [];
    for (const tool of toolUseBlocks) {
      console.log("AI requested tool", { toolName: tool.name, input: tool.input });
      const toolSection: CollapsibleSection = {
        id: `tool-${tool.id}`,
        type: 'tool_use',
        title: `${tool.name}`,
        summary: `Executing ${tool.name}...`,
        details: { input: tool.input },
        metadata: { status: 'running' }
      };
      sections.push(toolSection);
      const metadata: MessageMetadata = { toolCount, totalTokens: totalInputTokens + totalOutputTokens };
      if (thinkingContent) {
        metadata.thinking = thinkingContent;
      }
      await this.messageService.updateMessageContent(agentMessageId, {
        content: `Executing ${tool.name}...`,
        sections: [...sections],
        metadata
      });
      try {
        const result = await this.toolCoordinator.executeToolWithRetry(tool, userMessageId);
        if (tool.name === 'git_status' && result && typeof result === 'object') {
          const statusResult = result as GitStatusResult;
          if (statusResult.files && Array.isArray(statusResult.files)) {
            statusResult.files.forEach((file: GitFile) => {
              if (file.path) {
                allChangedFiles.add(file.path);
              }
            });
          }
        }
        toolSection.summary = `✓ ${tool.name} completed`;
        toolSection.details = { input: tool.input, result };
        toolSection.metadata = { status: 'done' };
        await this.messageService.updateMessageContent(agentMessageId, {
          sections: [...sections],
          metadata: { toolCount, totalTokens: totalInputTokens + totalOutputTokens }
        });
        toolResults.push(this.toolCoordinator.formatToolResult(tool, result));
      } catch (error) {
        console.error("Tool execution error", error);
        toolSection.summary = `✗ ${tool.name} failed`;
        toolSection.metadata = { status: 'error' };
        toolResults.push(this.toolCoordinator.formatToolError(tool, error));
      }
    }
    return toolResults;
  }
  private async finishWorkflow(
    agentMessageId: string,
    sections: CollapsibleSection[],
    content: string,
    toolCount: number,
    totalInputTokens: number,
    totalOutputTokens: number,
    thinkingContent: string | undefined,
    userId?: string,
    iterationCount?: number,
    status: 'completed' | 'error' = 'completed'
  ): Promise<void> {
    const totalTokens = totalInputTokens + totalOutputTokens;
    const metadata: MessageMetadata = { toolCount, totalTokens };
    if (thinkingContent) {
      metadata.thinking = thinkingContent;
    }
    if (iterationCount !== undefined) {
      metadata.iterationCount = iterationCount;
    }
    console.log("Updating agent message to finished state", {
      agentMessageId,
      status,
      contentLength: content.length,
      sectionsCount: sections.length
    });
    await this.messageService.updateMessageContent(agentMessageId, {
      content,
      sections,
      status,
      metadata
    });
    console.log("Agent message updated successfully", { agentMessageId, status });
    if (userId && (totalInputTokens > 0 || totalOutputTokens > 0)) {
      try {
        await this.usageTrackingService.recordTokenUsage(userId, totalInputTokens, totalOutputTokens);
        if (status === 'completed') {
          console.log("Token usage recorded", { userId, totalInputTokens, totalOutputTokens });
        }
      } catch (error) {
        console.error("Failed to record token usage", error);
      }
    }
  }
}
