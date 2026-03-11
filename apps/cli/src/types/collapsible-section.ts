import type { SectionDetails } from './commit.js';
import type { SectionStatus, SectionType, CommitType, Complexity } from './enums.js';
export { CommitType, SectionStatus, SectionType, Complexity } from './enums.js';
export interface GitHunk {
  file: string;
  startLine: number;
  endLine: number;
}
export interface CommitProposalData {
  message: string;
  description: string[];
  files: string[];
  hunks?: GitHunk[];
  rationale: string;
}
export interface CollapsibleSection {
  id: string;
  type: SectionType;
  title: string;
  summary: string;
  details?: SectionDetails;
  metadata?: {
    toolCount?: number;
    tokens?: number;
    duration?: number;
    status?: SectionStatus;
    proposalType?: CommitType;
    scope?: string;
    complexity?: Complexity;
    filesAffected?: number;
    approved?: boolean | null;
  };
  children?: CollapsibleSection[];
}
export interface MessageMetadata {
  totalTokens?: number;
  thinkingTime?: number;
  toolCount?: number;
  thinking?: string;
  iterationCount?: number;
}
