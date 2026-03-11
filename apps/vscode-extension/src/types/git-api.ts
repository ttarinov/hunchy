import * as vscode from 'vscode';
export interface GitExtensionAPI {
  getAPI(version: number): GitAPI;
}
export interface GitAPI {
  getRepository(uri: vscode.Uri): Repository | null;
}
export interface Repository {
  state: RepositoryState;
  show(revision: string, path: string): Promise<string>;
  log(options?: { maxEntries?: number }): Promise<Commit[]>;
}
export interface RepositoryState {
  workingTreeChanges: SourceControlResourceState[];
  indexChanges: SourceControlResourceState[];
}
export interface SourceControlResourceState {
  uri: vscode.Uri;
  status: number;
  originalUri?: vscode.Uri;
}
export interface Commit {
  hash: string;
  message: string;
  authorName?: string;
  authorDate: number;
}
