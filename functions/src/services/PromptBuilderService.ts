import { injectable } from "inversify";
import { CORE_PROMPT, ANALYSIS_SECTION, PROPOSAL_SECTION, ADVICE_SECTION } from "../prompts/commit-agent-prompt";
export enum WorkflowState {
  INITIAL = 'initial',
  ANALYZING = 'analyzing',
  PROPOSING = 'proposing',
  ADVICE = 'advice',
  COMPLETED = 'completed',
  ERROR = 'error'
}
@injectable()
export class PromptBuilderService {
  buildPrompt(state: WorkflowState): string {
    let prompt = CORE_PROMPT;
    switch (state) {
      case WorkflowState.ANALYZING:
        prompt += '\n\n' + ANALYSIS_SECTION;
        prompt += '\n\n' + PROPOSAL_SECTION;
        break;
      case WorkflowState.PROPOSING:
        prompt += '\n\n' + ANALYSIS_SECTION;
        prompt += '\n\n' + PROPOSAL_SECTION;
        break;
      case WorkflowState.ADVICE:
        prompt += '\n\n' + ADVICE_SECTION;
        break;
    }
    return prompt;
  }
  getInitialState(): WorkflowState {
    return WorkflowState.INITIAL;
  }
  determineState(
    hasToolResults: boolean,
    hasProposals: boolean
  ): WorkflowState {
    if (hasProposals) return WorkflowState.PROPOSING;
    if (hasToolResults) return WorkflowState.ANALYZING;
    return WorkflowState.INITIAL;
  }
}
