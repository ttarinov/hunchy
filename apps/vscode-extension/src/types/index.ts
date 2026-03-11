export interface GitFile {
  path: string;
  status: 'M' | 'A' | 'D' | '?' | 'R';
  staged?: boolean;
}
export interface GitStatus {
  files: GitFile[];
  hasChanges: boolean;
  hasStagedChanges: boolean;
}
export interface GitDiff {
  content: string;
  filePath?: string;
}
export interface CommitProposal {
  type: string;
  scope?: string;
  message: string;
  files: string[];
  description: string;
}
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposals?: CommitProposal[];
  status?: 'pending' | 'completed' | 'error';
  timestamp: number;
}
export type WebviewMessage =
  | { type: 'gitStatus'; data?: GitStatus }
  | { type: 'proposals'; data?: CommitProposal[] }
  | { type: 'message'; data?: Message }
  | { type: 'error'; data?: string }
  | { type: 'loading'; data?: boolean };
export type ExtensionMessage =
  | { type: 'requestCommit'; data?: { message: string } }
  | { type: 'approveProposal'; data?: { proposal: CommitProposal } }
  | { type: 'rejectProposal'; data?: { proposal: CommitProposal } }
  | { type: 'sendMessage'; data?: { content: string } };
