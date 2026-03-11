import { CommitProposalData, CommitType } from "./CommitProposalData";
export interface CollapsibleSectionModel {
  id: string;
  type: "agent" | "tool_use" | "thinking" | "commit_details" | "commit_proposal";
  title: string;
  summary: string;
  details?: CommitProposalData | Record<string, unknown>;
  metadata?: {
    toolCount?: number;
    tokens?: number;
    duration?: number;
    status?: "pending" | "running" | "done" | "error" | "executed";
    proposalType?: CommitType;
    scope?: string;
    complexity?: "low" | "medium" | "high";
    filesAffected?: number;
    approved?: boolean | null;
  };
  children?: CollapsibleSectionModel[];
}
export interface MessageMetadataModel {
  totalTokens?: number;
  thinkingTime?: number;  
  toolCount?: number;
  thinking?: string;  
  iterationCount?: number;  
}
export type CollapsibleSection = CollapsibleSectionModel;
export type MessageMetadata = MessageMetadataModel;
