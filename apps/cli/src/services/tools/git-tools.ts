import { GitService } from '../git-service.js';
import type { ToolHandler } from '../../types/tool.js';
import { wrapToolExecution } from '../../utils/tool-wrapper.js';
export function createGitTools(gitService: GitService): Map<string, ToolHandler> {
  const tools = new Map<string, ToolHandler>();
  tools.set('git_status', async () => {
    return wrapToolExecution(async () => {
      const isRepo = await gitService.isGitRepo();
      if (!isRepo) {
        throw new Error('Not a git repository');
      }
      return await gitService.getStatus();
    });
  });
  tools.set('git_diff', async (input) => {
    return wrapToolExecution(async () => {
      const staged = input.staged as boolean | undefined;
      return await gitService.getDiff(staged || false);
    });
  });
  tools.set('git_diff_file', async (input) => {
    return wrapToolExecution(async () => {
      const filePath = input.file_path as string;
      if (!filePath) {
        throw new Error('file_path is required');
      }
      return await gitService.getDiffForFile(filePath);
    });
  });
  tools.set('git_log', async (input) => {
    return wrapToolExecution(async () => {
      const count = input.count as number | undefined;
      return await gitService.getLog(count || 10);
    });
  });
  tools.set('git_show_file', async (input) => {
    return wrapToolExecution(async () => {
      const filePath = input.file_path as string;
      if (!filePath) {
        throw new Error('file_path is required');
      }
      const revision = input.revision as string | undefined;
      return await gitService.showFile(filePath, revision || 'HEAD');
    });
  });

  tools.set('git_commit', async (input) => {
    return wrapToolExecution(async () => {
      const message = input.message as string;
      const files = input.files as string[];

      if (!message) {
        throw new Error('message is required');
      }
      if (!files || !Array.isArray(files) || files.length === 0) {
        throw new Error('files array is required and must not be empty');
      }

      const isRepo = await gitService.isGitRepo();
      if (!isRepo) {
        throw new Error('Not a git repository');
      }

      const result = await gitService.createCommit(message, files);

      return {
        hash: result.hash,
        message: result.message,
        filesCommitted: result.filesCommitted,
        summary: `Created commit ${result.hash.substring(0, 7)}: ${result.message}`
      };
    });
  });

  return tools;
}
