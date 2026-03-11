export interface GitFile {
  path: string;
  status?: string;
}
export interface GitStatusResult {
  files: GitFile[];
  hasChanges?: boolean;
  hasStagedChanges?: boolean;
  summary?: {
    totalFiles: number;
    staged: number;
    modified: number;
    untracked: number;
  };
}
