import { simpleGit, SimpleGit } from 'simple-git';
export interface GitStatus {
  staged: string[];
  modified: string[];
  untracked: string[];
  summary?: {
    totalFiles: number;
    staged: number;
    modified: number;
    untracked: number;
  };
}
export class GitService {
  private git: SimpleGit;
  constructor(repoPath?: string) {
    this.git = simpleGit(repoPath || process.cwd());
  }
  async getStatus(): Promise<GitStatus> {
    const status = await this.git.status();
    const staged = status.staged;
    const modified = status.modified;
    const untracked = status.not_added;
    return {
      staged,
      modified,
      untracked,
      summary: {
        totalFiles: staged.length + modified.length + untracked.length,
        staged: staged.length,
        modified: modified.length,
        untracked: untracked.length
      }
    };
  }
  async getDiff(staged: boolean = false): Promise<string> {
    if (staged) {
      return await this.git.diff(['--cached']);
    }
    return await this.git.diff();
  }
  async getDiffForFile(filePath: string): Promise<string> {
    return await this.git.diff(['--', filePath]);
  }
  async getLog(count: number = 10): Promise<Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>> {
    const log = await this.git.log({ maxCount: count });
    return log.all.map(commit => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.author_name,
      date: commit.date
    }));
  }
  async showFile(filePath: string, revision: string = 'HEAD'): Promise<string> {
    return await this.git.show([`${revision}:${filePath}`]);
  }
  async getCurrentBranch(): Promise<string> {
    const status = await this.git.status();
    return status.current || 'unknown';
  }
  async isGitRepo(): Promise<boolean> {
    try {
      await this.git.status();
      return true;
    } catch {
      return false;
    }
  }
  async addFiles(files: string[]): Promise<void> {
    if (files.length === 0) return;
    await this.git.add(files);
  }
  async commit(message: string): Promise<string> {
    const result = await this.git.commit(message);
    if (result.commit) {
      return result.commit;
    }
    const log = await this.git.log({ maxCount: 1 });
    return log.latest?.hash || '';
  }
  async getLastCommitHash(): Promise<string> {
    const log = await this.git.log({ maxCount: 1 });
    return log.latest?.hash.substring(0, 7) || '';
  }

  async createCommit(message: string, files: string[]): Promise<{
    hash: string;
    message: string;
    filesCommitted: string[];
  }> {
    if (files.length === 0) {
      throw new Error('No files specified for commit');
    }

    // Add files to staging
    await this.addFiles(files);

    // Create commit
    const commitHash = await this.commit(message);

    return {
      hash: commitHash,
      message,
      filesCommitted: files
    };
  }
}
