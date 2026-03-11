import { injectable } from "inversify";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageParam, Tool, TextBlock, ToolUseBlock, ThinkingBlock } from "@anthropic-ai/sdk/resources/messages";
export type ContentBlock = TextBlock | ToolUseBlock | ThinkingBlock;
export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
}
export interface StreamingCallbacks {
  onThinkingStart?: () => void;
  onThinkingDelta?: (content: string) => void;
  onThinkingEnd?: () => void;
  onToolUse?: (tool: ToolUseBlock) => void;
  onTextDelta?: (content: string) => void;
  onTextComplete?: (content: string) => void;
}
export interface StreamMessageResult {
  contentBlocks: ContentBlock[];
  usage?: TokenUsage;
}
@injectable()
export class AnthropicClient {
  private client: Anthropic;
  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    this.client = new Anthropic({ apiKey });
  }
  public async streamMessage(
    systemPrompt: string,
    messages: MessageParam[],
    tools: Tool[],
    callbacks: StreamingCallbacks
  ): Promise<StreamMessageResult> {
    const stream = this.client.messages.stream({
      model: 'claude-haiku-4-5',
      max_tokens: 8000,
      system: systemPrompt,
      messages: messages,
      tools: tools
    });
    let fullText = '';
    let thinkingText = '';
    stream.on('text', (textDelta: string) => {
      fullText += textDelta;
      callbacks.onTextDelta?.(textDelta);
    });
    const finalMessage = await stream.finalMessage();
    const contentBlocks: ContentBlock[] = [];
    for (const block of finalMessage.content) {
      if (block.type === 'thinking') {
        thinkingText = block.thinking || '';
        callbacks.onThinkingStart?.();
        if (thinkingText) {
          callbacks.onThinkingDelta?.(thinkingText);
        }
        callbacks.onThinkingEnd?.();
        contentBlocks.push(block);
      } else if (block.type === 'tool_use') {
        callbacks.onToolUse?.(block);
        contentBlocks.push(block);
      } else if (block.type === 'text') {
        if (!fullText) {
          fullText = block.text;
        }
        callbacks.onTextComplete?.(fullText);
        contentBlocks.push(block);
      }
    }
    const usage: TokenUsage | undefined = finalMessage.usage ? {
      input_tokens: finalMessage.usage.input_tokens,
      output_tokens: finalMessage.usage.output_tokens
    } : undefined;
    return {
      contentBlocks,
      usage
    };
  }
  public async continueWithToolResults(
    systemPrompt: string,
    messages: MessageParam[],
    tools: Tool[],
    callbacks: StreamingCallbacks
  ): Promise<StreamMessageResult> {
    return this.streamMessage(systemPrompt, messages, tools, callbacks);
  }
  public getClient(): Anthropic {
    return this.client;
  }
}
