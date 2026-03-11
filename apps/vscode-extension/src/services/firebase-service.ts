import * as vscode from 'vscode';
export interface RecordCommitParams {
  hash: string;
  message: string;
  linesChanged: number;
  filesChanged: number;
}
export class FirebaseService {
  private functionsUrl: string;
  constructor() {
    const config = vscode.workspace.getConfiguration('hunchy');
    const functionsUrl = config.get<string>('functionsUrl');
    this.functionsUrl = functionsUrl || 'https://us-central1-hunchy-4a0dc.cloudfunctions.net';
  }
  async recordCommit(params: RecordCommitParams, idToken?: string): Promise<{ success: boolean }> {
    if (!idToken) {
      console.warn('No auth token available, skipping commit recording');
      return { success: false };
    }
    try {
      const response = await fetch(`${this.functionsUrl}/recordCommit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          data: params,
        }),
      });
      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to record commit:', error);
        return { success: false };
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error recording commit:', error);
      return { success: false };
    }
  }
}
