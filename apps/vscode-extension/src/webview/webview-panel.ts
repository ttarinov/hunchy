import * as vscode from 'vscode';
import { WebviewMessage, ExtensionMessage } from '../types';
export class WebviewPanel {
  private panel: vscode.WebviewPanel | undefined;
  private disposables: vscode.Disposable[] = [];
  constructor(
    private context: vscode.ExtensionContext,
    private onMessage: (message: ExtensionMessage) => void
  ) {}
  create(): void {
    if (this.panel) {
      this.panel.reveal();
      return;
    }
    this.panel = vscode.window.createWebviewPanel(
      'hunchy',
      'Hunchy - AI Commit Assistant',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [this.context.extensionUri]
      }
    );
    this.panel.webview.html = this.getWebviewContent();
    this.panel.webview.onDidReceiveMessage(
      (message: ExtensionMessage) => {
        this.onMessage(message);
      },
      null,
      this.disposables
    );
    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      this.disposables
    );
  }
  postMessage(message: WebviewMessage): void {
    if (this.panel) {
      this.panel.webview.postMessage(message);
    }
  }
  reveal(): void {
    if (this.panel) {
      this.panel.reveal();
    }
  }
  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
    }
    this.disposables.forEach(d => d.dispose());
  }
  private getWebviewContent(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hunchy</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: var(--vscode-font-family);
            font-size: var(--vscode-font-size);
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
            height: 100vh;
            overflow: hidden;
        }
        #root {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
        }
        .header {
            padding: 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-sideBar-background);
        }
        .header h2 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
        }
        .content {
            flex: 1;
            overflow: auto;
            padding: 16px;
        }
        .footer {
            border-top: 1px solid var(--vscode-panel-border);
            padding: 12px;
            background-color: var(--vscode-sideBar-background);
        }
        .chat-form {
            display: flex;
            gap: 8px;
        }
        .chat-input {
            flex: 1;
            padding: 8px 12px;
            border-radius: 4px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-size: 14px;
            outline: none;
        }
        .chat-button {
            padding: 8px 16px;
            border-radius: 4px;
            border: none;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        }
        .chat-button:disabled {
            background-color: var(--vscode-button-secondaryBackground);
            cursor: not-allowed;
        }
        .message {
            margin-bottom: 16px;
            padding: 12px;
            border-radius: 6px;
            max-width: 80%;
        }
        .message-user {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            margin-left: auto;
            margin-right: 0;
        }
        .message-assistant {
            background-color: var(--vscode-input-background);
            color: var(--vscode-foreground);
            margin-left: 0;
            margin-right: auto;
        }
        .proposal {
            margin-bottom: 16px;
            padding: 16px;
            border-radius: 6px;
            border: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-editor-background);
        }
        .proposal-header {
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .proposal-title {
            font-size: 16px;
            font-weight: 600;
            color: var(--vscode-textLink-foreground);
            margin-bottom: 4px;
        }
        .proposal-description {
            font-size: 13px;
            color: var(--vscode-descriptionForeground);
            margin-top: 4px;
        }
        .proposal-files {
            margin-bottom: 12px;
        }
        .proposal-files-title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        .proposal-files-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
            max-height: 150px;
            overflow-y: auto;
            padding: 8px;
            background-color: var(--vscode-input-background);
            border-radius: 4px;
        }
        .proposal-file {
            font-size: 12px;
            font-family: var(--vscode-editor-font-family);
            padding: 2px 0;
        }
        .proposal-actions {
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        }
        .proposal-button {
            padding: 6px 12px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
        }
        .proposal-button-reject {
            border: 1px solid var(--vscode-button-secondaryBackground);
            background-color: transparent;
            color: var(--vscode-foreground);
        }
        .proposal-button-approve {
            border: none;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            font-weight: 500;
        }
        .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: var(--vscode-descriptionForeground);
        }
        .loading {
            padding: 12px;
            border-radius: 6px;
            background-color: var(--vscode-input-background);
            color: var(--vscode-foreground);
            max-width: 80%;
        }
    </style>
</head>
<body>
    <div id="root">
        <div class="header">
            <h2>Hunchy - AI Commit Assistant</h2>
        </div>
        <div class="content" id="content"></div>
        <div class="footer">
            <form class="chat-form" id="chatForm">
                <input type="text" class="chat-input" id="chatInput" placeholder="Type 'commit' to generate proposals..." />
                <button type="submit" class="chat-button" id="chatButton">Send</button>
            </form>
        </div>
    </div>
    <script>
        const vscode = acquireVsCodeApi();
        const content = document.getElementById('content');
        const chatForm = document.getElementById('chatForm');
        const chatInput = document.getElementById('chatInput');
        const chatButton = document.getElementById('chatButton');
        let messages = [];
        let proposals = [];
        let isLoading = false;
        function render() {
            if (messages.length === 0 && proposals.length === 0 && !isLoading) {
                content.innerHTML = '<div class="empty-state"><p>Type "commit" to generate commit proposals from your changes</p></div>';
                return;
            }
            let html = '';
            messages.forEach(msg => {
                const className = msg.role === 'user' ? 'message-user' : 'message-assistant';
                html += \`<div class="message \${className}">\${msg.content}</div>\`;
            });
            if (isLoading) {
                html += '<div class="loading">Analyzing changes and generating proposals...</div>';
            }
            if (proposals.length > 0) {
                html += \`<h3 style="font-size: 16px; font-weight: 600; margin: 24px 0 16px 0;">Commit Proposals (\${proposals.length})</h3>\`;
                proposals.forEach((proposal, index) => {
                    const title = proposal.scope 
                        ? \`\${proposal.type}(\${proposal.scope}): \${proposal.message}\`
                        : \`\${proposal.type}: \${proposal.message}\`;
                    html += \`
                        <div class="proposal">
                            <div class="proposal-header">
                                <div class="proposal-title">\${title}</div>
                                <div class="proposal-description">\${proposal.description}</div>
                            </div>
                            <div class="proposal-files">
                                <div class="proposal-files-title">Files (\${proposal.files.length})</div>
                                <div class="proposal-files-list">
                                    \${proposal.files.map(f => \`<div class="proposal-file">\${f}</div>\`).join('')}
                                </div>
                            </div>
                            <div class="proposal-actions">
                                <button class="proposal-button proposal-button-reject" onclick="rejectProposal(\${index})">Reject</button>
                                <button class="proposal-button proposal-button-approve" onclick="approveProposal(\${index})">Approve & Commit</button>
                            </div>
                        </div>
                    \`;
                });
            }
            content.innerHTML = html;
        }
        window.rejectProposal = (index) => {
            proposals.splice(index, 1);
            render();
        };
        window.approveProposal = (index) => {
            const proposal = proposals[index];
            vscode.postMessage({
                type: 'approveProposal',
                data: { proposal }
            });
            proposals.splice(index, 1);
            render();
        };
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const message = chatInput.value.trim();
            if (!message || isLoading) return;
            messages.push({
                id: 'msg-' + Date.now(),
                role: 'user',
                content: message,
                timestamp: Date.now()
            });
            chatInput.value = '';
            isLoading = true;
            render();
            vscode.postMessage({
                type: 'requestCommit',
                data: { message }
            });
        });
        window.addEventListener('message', (event) => {
            const message = event.data;
            switch (message.type) {
                case 'proposals':
                    proposals = message.data || [];
                    isLoading = false;
                    if (message.data && message.data.length > 0) {
                        messages.push({
                            id: 'msg-' + Date.now(),
                            role: 'assistant',
                            content: \`Generated \${message.data.length} commit proposal(s)\`,
                            proposals: message.data,
                            status: 'completed',
                            timestamp: Date.now()
                        });
                    }
                    render();
                    break;
                case 'message':
                    messages.push(message.data);
                    render();
                    break;
                case 'loading':
                    isLoading = message.data;
                    render();
                    break;
                case 'error':
                    isLoading = false;
                    messages.push({
                        id: 'msg-' + Date.now(),
                        role: 'assistant',
                        content: \`Error: \${message.data}\`,
                        status: 'error',
                        timestamp: Date.now()
                    });
                    render();
                    break;
            }
        });
        render();
    </script>
</body>
</html>`;
  }
}
