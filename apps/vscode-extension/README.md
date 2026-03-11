# Hunchy VS Code Extension

AI-powered commit intelligence for VS Code.

## Local Development & Testing

### Prerequisites

- Node.js >= 20
- VS Code >= 1.80.0
- pnpm (recommended) or npm

### Setup

1. **Install dependencies:**

```bash
cd apps/vscode-extension
pnpm install
# or
npm install
```

2. **Compile TypeScript:**

```bash
pnpm run compile
# or
npm run compile
```

For development with auto-recompile:

```bash
pnpm run watch
# or
npm run watch
```

### Testing the Extension

#### Method 1: Using VS Code Debugger (Recommended)

1. Open the `apps/vscode-extension` folder in VS Code
2. Press `F5` or go to Run > Start Debugging
3. A new VS Code window will open (Extension Development Host)
4. In the new window:
   - Open a folder that contains a git repository
   - Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
   - Run: `Hunchy: Generate Commits` or `Hunchy: Open Hunchy Panel`
   - Type "commit" in the chat input
   - View the generated commit proposals
   - Approve proposals to commit them

#### Method 2: Using Command Line

1. Compile the extension:
```bash
pnpm run compile
```

2. Package and install (for testing):
```bash
# In the extension directory
vsce package
code --install-extension hunchy-0.0.1.vsix
```

### Testing Steps

1. **Open a Git Repository:**
   - In the Extension Development Host window, open a folder with git changes
   - Make some changes to files if needed

2. **Open Hunchy Panel:**
   - Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
   - Type "Hunchy: Open Hunchy Panel" and select it
   - Or use "Hunchy: Generate Commits" to directly generate proposals

3. **Generate Commit Proposals:**
   - In the Hunchy panel, type "commit" in the input field
   - Click "Send" or press Enter
   - Wait for the mock AI to analyze your changes
   - View the generated commit proposals

4. **Approve/Reject Proposals:**
   - Review each proposal (type, scope, message, files)
   - Click "Approve & Commit" to commit the changes
   - Click "Reject" to dismiss a proposal

### Troubleshooting

- **Extension not loading:** Make sure you compiled with `pnpm run compile`
- **Git API errors:** Ensure you have a git repository open and the Git extension is enabled
- **Webview not showing:** Check the Output panel for errors (View > Output > select "Hunchy")
- **No proposals generated:** Make sure you have uncommitted changes in your git repository

### Development Tips

- Use `pnpm run watch` to auto-recompile on file changes
- Reload the Extension Development Host window after code changes (Cmd+R / Ctrl+R)
- Check the Debug Console for extension logs
- Check the Output panel for webview errors
