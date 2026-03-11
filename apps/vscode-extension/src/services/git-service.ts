import * as vscode from 'vscode';
import { GitFile, GitStatus, GitDiff } from '../types';
import { GitExtensionAPI, GitAPI, SourceControlResourceState, Commit as GitCommit } from '../types/git-api';
export class GitService {
  private gitExtension: vscode.Extension<GitExtensionAPI> | undefined;
  constructor() {
    this.gitExtension = vscode.extensions.getExtension('vscode.git');
  }
  private async getGitAPI(): Promise<GitAPI> {
    if (!this.gitExtension) {
      throw new Error('Git extension not found');
    }
    if (!this.gitExtension.isActive) {
      await this.gitExtension.activate();
    }
    return this.gitExtension.exports.getAPI(1);
  }
  async getStatus(): Promise<GitStatus> {
    const git = await this.getGitAPI();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }
    const repo = git.getRepository(workspaceFolders[0].uri);
    if (!repo) {
      throw new Error('No git repository found');
    }
    const state = repo.state;
    const files: GitFile[] = [];
    state.workingTreeChanges.forEach((change: SourceControlResourceState) => {
      files.push({
        path: change.uri.fsPath,
        status: this.mapStatus(change.status),
        staged: false
      });
    });
    state.indexChanges.forEach((change: SourceControlResourceState) => {
      files.push({
        path: change.uri.fsPath,
        status: this.mapStatus(change.status),
        staged: true
      });
    });
    return {
      files,
      hasChanges: files.length > 0,
      hasStagedChanges: state.indexChanges.length > 0
    };
  }
  async getDiff(staged: boolean = false): Promise<GitDiff> {
    const git = await this.getGitAPI();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }
    const repo = git.getRepository(workspaceFolders[0].uri);
    if (!repo) {
      throw new Error('No git repository found');
    }
    const changes = staged ? repo.state.indexChanges : repo.state.workingTreeChanges;
    let diffContent = '';
    for (const change of changes) {
      try {
        const diff = await this.getDiffForFile(change.uri.fsPath);
        diffContent += diff.content + '\n';
      } catch (error) {
        console.error(`Error getting diff for ${change.uri.fsPath}:`, error);
      }
    }
    return { content: diffContent };
  }
  async getDiffForFile(filePath: string): Promise<GitDiff> {
    const git = await this.getGitAPI();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }
    const repo = git.getRepository(workspaceFolders[0].uri);
    if (!repo) {
      throw new Error('No git repository found');
    }
    const uri = vscode.Uri.file(filePath);
    const change = [...repo.state.workingTreeChanges, ...repo.state.indexChanges]
      .find(c => c.uri.fsPath === filePath);
    if (!change) {
      return { content: '', filePath };
    }
    try {
      const originalUri = change.originalUri || change.uri;
      const originalContent = await vscode.workspace.fs.readFile(originalUri);
      const modifiedContent = await vscode.workspace.fs.readFile(change.uri);
      const originalText = Buffer.from(originalContent).toString('utf-8');
      const modifiedText = Buffer.from(modifiedContent).toString('utf-8');
      return {
        content: this.createUnifiedDiff(filePath, originalText, modifiedText),
        filePath
      };
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return { content: '', filePath };
    }
  }
  async getLog(count: number = 10): Promise<Array<{
    hash: string;
    message: string;
    author: string;
    date: string;
  }>> {
    const git = await this.getGitAPI();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }
    const repo = git.getRepository(workspaceFolders[0].uri);
    if (!repo) {
      throw new Error('No git repository found');
    }
    const log = await repo.log({ maxEntries: count });
    return log.map((commit: GitCommit) => ({
      hash: commit.hash,
      message: commit.message,
      author: commit.authorName || 'Unknown',
      date: new Date(commit.authorDate * 1000).toISOString()
    }));
  }
  async getCommitStats(hash: string, filePaths?: string[]): Promise<{
    linesAdded: number;
    linesDeleted: number;
    filesChanged: number;
  }> {
    const git = await this.getGitAPI();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }
    const repo = git.getRepository(workspaceFolders[0].uri);
    if (!repo) {
      throw new Error('No git repository found');
    }
    try {
      let linesAdded = 0;
      let linesDeleted = 0;
      const filesChanged = new Set<string>();
      if (filePaths && filePaths.length > 0) {
        for (const filePath of filePaths) {
          try {
            const parentContent = await repo.show(hash + '^', filePath).catch(() => '');
            const currentContent = await repo.show(hash, filePath).catch(() => '');
            const parentLines = parentContent.split('\n');
            const currentLines = currentContent.split('\n');
            let added = 0;
            let deleted = 0;
            const maxLen = Math.max(parentLines.length, currentLines.length);
            for (let i = 0; i < maxLen; i++) {
              if (i >= parentLines.length) {
                added++;
              } else if (i >= currentLines.length) {
                deleted++;
              } else if (parentLines[i] !== currentLines[i]) {
                if (i < currentLines.length && !parentLines.includes(currentLines[i])) {
                  added++;
                }
                if (i < parentLines.length && !currentLines.includes(parentLines[i])) {
                  deleted++;
                }
              }
            }
            linesAdded += added;
            linesDeleted += deleted;
            filesChanged.add(filePath);
          } catch (error) {
            filesChanged.add(filePath);
          }
        }
      } else {
        filesChanged.add('unknown');
      }
      return {
        linesAdded,
        linesDeleted,
        filesChanged: filesChanged.size || 1,
      };
    } catch (error) {
      console.error(`Error getting commit stats for ${hash}:`, error);
      return {
        linesAdded: 0,
        linesDeleted: 0,
        filesChanged: filePaths?.length || 1,
      };
    }
  }
  async getLatestCommitHash(): Promise<string | null> {
    const log = await this.getLog(1);
    return log.length > 0 ? log[0].hash : null;
  }
  async showFile(filePath: string, revision: string = 'HEAD'): Promise<string> {
    const git = await this.getGitAPI();
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      throw new Error('No workspace folder found');
    }
    const repo = git.getRepository(workspaceFolders[0].uri);
    if (!repo) {
      throw new Error('No git repository found');
    }
    try {
      const uri = vscode.Uri.file(filePath);
      const content = await repo.show(revision, uri.fsPath);
      return content;
    } catch (error) {
      console.error(`Error showing file ${filePath} at ${revision}:`, error);
      return '';
    }
  }
  async isGitRepo(): Promise<boolean> {
    try {
      const git = await this.getGitAPI();
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        return false;
      }
      const repo = git.getRepository(workspaceFolders[0].uri);
      return repo !== null;
    } catch {
      return false;
    }
  }
  private mapStatus(status: number): 'M' | 'A' | 'D' | '?' | 'R' {
    if (status === 1) return 'M';
    if (status === 2) return 'A';
    if (status === 3) return 'D';
    if (status === 4) return 'R';
    return '?';
  }
  private createUnifiedDiff(filePath: string, original: string, modified: string): string {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    let diff = `--- a/${filePath}\n+++ b/${filePath}\n`;
    let i = 0;
    let j = 0;
    while (i < originalLines.length || j < modifiedLines.length) {
      if (i >= originalLines.length) {
        diff += `+${modifiedLines[j]}\n`;
        j++;
      } else if (j >= modifiedLines.length) {
        diff += `-${originalLines[i]}\n`;
        i++;
      } else if (originalLines[i] === modifiedLines[j]) {
        diff += ` ${originalLines[i]}\n`;
        i++;
        j++;
      } else {
        diff += `-${originalLines[i]}\n`;
        diff += `+${modifiedLines[j]}\n`;
        i++;
        j++;
      }
    }
    return diff;
  }
}
