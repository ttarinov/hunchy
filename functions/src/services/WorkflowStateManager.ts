import { injectable } from "inversify";
import { WorkflowState } from "./PromptBuilderService";
const MAX_CONVERSATION_LENGTH = 15;
@injectable()
export class WorkflowStateManager {
  private currentState: WorkflowState = WorkflowState.INITIAL;
  getCurrentState(): WorkflowState {
    return this.currentState;
  }
  setState(state: WorkflowState): void {
    this.currentState = state;
  }
  pruneConversationHistory<T>(messages: T[]): T[] {
    if (messages.length <= MAX_CONVERSATION_LENGTH) {
      return messages;
    }
    const firstMessage = messages[0];
    const recentMessages = messages.slice(-MAX_CONVERSATION_LENGTH);
    return [firstMessage, ...recentMessages];
  }
}
