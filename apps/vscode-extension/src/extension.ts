import * as vscode from 'vscode';
import { GitService } from './services/git-service';
import { MockAIService } from './services/mock-ai-service';
import { FirebaseService } from './services/firebase-service';
import { WebviewPanel } from './webview/webview-panel';
import { ExtensionMessage, CommitProposal } from './types';
export function activate(context: vscode.ExtensionContext) {
  const gitService = new GitService();
  const mockAIService = new MockAIService();
  const firebaseService = new FirebaseService();
  let webviewPanel: WebviewPanel | undefined;
  const createWebviewPanel = () => {
    if (!webviewPanel) {
      webviewPanel = new WebviewPanel(context, handleWebviewMessage);
      webviewPanel.create();
    } else {
      webviewPanel.reveal();
    }
    return webviewPanel;
  };
  const handleWebviewMessage = async (message: ExtensionMessage) => {
    if (!webviewPanel) return;
    try {
      switch (message.type) {
        case 'requestCommit':
          await handleCommitRequest(message.data?.message || 'commit');
          break;
        case 'approveProposal':
          await handleApproveProposal(message.data?.proposal);
          break;
        case 'rejectProposal':
          break;
        default:
          console.log('Unknown message type:', message.type);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      webviewPanel.postMessage({
        type: 'error',
        data: errorMessage
      });
    }
  };
  const handleCommitRequest = async (userMessage: string) => {
    if (!webviewPanel) return;
    try {
      webviewPanel.postMessage({
        type: 'loading',
        data: true
      });
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        webviewPanel.postMessage({
          type: 'error',
          data: 'No workspace folder open. Please open a folder in VS Code first.'
        });
        webviewPanel.postMessage({
          type: 'loading',
          data: false
        });
        return;
      }
      const isGitRepo = await gitService.isGitRepo();
      if (!isGitRepo) {
        webviewPanel.postMessage({
          type: 'error',
          data: 'No git repository found. Please open a folder with a git repository.'
        });
        webviewPanel.postMessage({
          type: 'loading',
          data: false
        });
        return;
      }
      const gitStatus = await gitService.getStatus();
      if (!gitStatus.hasChanges) {
        webviewPanel.postMessage({
          type: 'message',
          data: {
            id: `msg-${Date.now()}`,
            role: 'assistant',
            content: 'No changes detected. Make some changes to your files and try again.',
            status: 'completed',
            timestamp: Date.now()
          }
        });
        webviewPanel.postMessage({
          type: 'loading',
          data: false
        });
        return;
      }
      const proposals = await mockAIService.generateProposals(gitStatus);
      webviewPanel.postMessage({
        type: 'proposals',
        data: proposals
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      webviewPanel.postMessage({
        type: 'error',
        data: errorMessage
      });
      webviewPanel.postMessage({
        type: 'loading',
        data: false
      });
    }
  };
  const handleApproveProposal = async (proposal: CommitProposal | undefined) => {
    if (!proposal) {
      vscode.window.showErrorMessage('Invalid proposal');
      return;
    }
    try {
      const git = await getGitAPI();
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder found');
        return;
      }
      const repo = git.getRepository(workspaceFolders[0].uri);
      if (!repo) {
        vscode.window.showErrorMessage('No git repository found');
        return;
      }
      const commitMessage = proposal.scope
        ? `${proposal.type}(${proposal.scope}): ${proposal.message}`
        : `${proposal.type}: ${proposal.message}`;
      const urisToStage: vscode.Uri[] = [];
      for (const filePath of proposal.files) {
        const uri = vscode.Uri.file(filePath);
        const change = [...repo.state.workingTreeChanges, ...repo.state.indexChanges]
          .find(c => c.uri.fsPath === filePath);
        if (change) {
          urisToStage.push(uri);
        }
      }
      if (urisToStage.length > 0) {
        for (const uri of urisToStage) {
          await repo.add([uri]);
        }
      }
      if (repo.state.indexChanges.length > 0 || urisToStage.length > 0) {
        await repo.commit(commitMessage);
        vscode.window.showInformationMessage(`Committed: ${commitMessage}`);
        try {
          const commitHash = await gitService.getLatestCommitHash();
          if (commitHash) {
            const stats = await gitService.getCommitStats(commitHash, proposal.files);
            const linesChanged = stats.linesAdded + stats.linesDeleted;
            const idToken = await getAuthToken();
            await firebaseService.recordCommit({
              hash: commitHash,
              message: commitMessage,
              linesChanged,
              filesChanged: stats.filesChanged,
            }, idToken);
          }
        } catch (error) {
          console.error('Failed to record commit details:', error);
        }
        if (webviewPanel) {
          webviewPanel.postMessage({
            type: 'message',
            data: {
              id: `msg-${Date.now()}`,
              role: 'assistant',
              content: `Successfully committed: ${commitMessage}`,
              status: 'completed',
              timestamp: Date.now()
            }
          });
        }
      } else {
        vscode.window.showWarningMessage('No changes to commit');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      vscode.window.showErrorMessage(`Failed to commit: ${errorMessage}`);
      if (webviewPanel) {
        webviewPanel.postMessage({
          type: 'error',
          data: `Failed to commit: ${errorMessage}`
        });
      }
    }
  };
  const getGitAPI = async () => {
    const gitExtension = vscode.extensions.getExtension('vscode.git');
    if (!gitExtension) {
      throw new Error('Git extension not found');
    }
    if (!gitExtension.isActive) {
      await gitExtension.activate();
    }
    return gitExtension.exports.getAPI(1);
  };
  const getAuthToken = async (): Promise<string | undefined> => {
    const config = vscode.workspace.getConfiguration('hunchy');
    const token = config.get<string>('authToken');
    return token;
  };
  const commitCommand = vscode.commands.registerCommand('hunchy.commit', async () => {
    const panel = createWebviewPanel();
    await handleCommitRequest('commit');
  });
  const openPanelCommand = vscode.commands.registerCommand('hunchy.openPanel', () => {
    createWebviewPanel();
  });
  context.subscriptions.push(commitCommand, openPanelCommand);
  context.subscriptions.push({
    dispose: () => {
      if (webviewPanel) {
        webviewPanel.dispose();
      }
    }
  });
}
export function deactivate() {}
