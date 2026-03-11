export type CommitType = 'feat' | 'fix' | 'refactor' | 'test' | 'docs' | 'style' | 'chore' | 'perf';
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
export interface CommitProposalMetadata {
  proposalType: CommitType;
  scope: string;
  complexity: 'low' | 'medium' | 'high';
  filesAffected: number;
  approved: boolean | null;
}
