import type { CommitProposalData } from './collapsible-section.js';
import type { CommitStep } from './enums.js';
export { CommitStep } from './enums.js';
export interface CommitExecutionDetails {
  step?: CommitStep;
  files?: string[];
  commands?: string[];
  hash?: string;
  message?: string;
}
export interface ToolUseDetails {
  tool: string;
  input: Record<string, unknown>;
  result?: unknown;
  error?: string;
}
export interface ThinkingDetails {
  content: string;
}
export type SectionDetails = 
  | CommitProposalData 
  | CommitExecutionDetails
  | ToolUseDetails 
  | ThinkingDetails
  | Record<string, unknown>;
