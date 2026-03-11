import { GitService } from './git-service.js';
import type { ParsedCommit } from '../utils/commit/commit-parser.js';
import { callFunction } from '../utils/functions-client.js';
import { ApiClient } from '../auth/api-client.js';
import { getErrorMessage } from '../utils/error-utils.js';
import { AuthTokenService } from './auth-token-service.js';
export interface CommitExecutionResult {
  success: boolean;
  commit: ParsedCommit;
  hash?: string;
  error?: string;
}
export class CommitExecutor {
  private gitService: GitService;
  constructor(repoPath?: string) {
    this.gitService = new GitService(repoPath);
  }
  async notifyCommitRecorded(userId: string): Promise<void> {
    try {
      const apiClient = new ApiClient();
      const idToken = await apiClient.getAuthToken();
      if (!idToken) {
        console.warn('No auth token available, skipping commit tracking');
        return;
      }
      await callFunction('recordCommit', {}, idToken);
    } catch (error) {
      console.warn('Failed to record commit in backend:', error);
    }
  }
  async executeCommit(commit: ParsedCommit): Promise<CommitExecutionResult> {
    try {
      if (commit.files.length === 0) {
        return {
          success: false,
          commit,
          error: 'No files specified for commit'
        };
      }
      await this.gitService.addFiles(commit.files);
      const hash = await this.gitService.commit(commit.message);
      return {
        success: true,
        commit: {
          ...commit,
          hash
        },
        hash
      };
    } catch (error) {
      return {
        success: false,
        commit,
        error: getErrorMessage(error)
      };
    }
  }
  async executeCommits(commits: ParsedCommit[]): Promise<CommitExecutionResult[]> {
    const results: CommitExecutionResult[] = [];
    for (const commit of commits) {
      const result = await this.executeCommit(commit);
      results.push(result);
      if (!result.success) {
        break;
      }
    }
    return results;
  }
  async verifyCommits(commits: ParsedCommit[]): Promise<boolean> {
    try {
      const log = await this.gitService.getLog(commits.length);
      const commitHashes = log.map(c => c.hash);
      return commits.every(commit => {
        if (!commit.hash) return false;
        if (commitHashes.includes(commit.hash)) {
          return true;
        }
        const commitHashShort = commit.hash.substring(0, 7);
        const logHashesShort = commitHashes.map(h => h.substring(0, 7));
        return logHashesShort.includes(commitHashShort);
      });
    } catch {
      return false;
    }
  }
}
