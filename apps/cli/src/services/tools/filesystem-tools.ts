import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import type { ToolHandler } from '../../types/tool.js';
import { wrapToolExecution } from '../../utils/tool-wrapper.js';
export function createFilesystemTools(): Map<string, ToolHandler> {
  const tools = new Map<string, ToolHandler>();
  tools.set('list_files', async (input) => {
    return wrapToolExecution(async () => {
      const path = (input.path as string | undefined) || process.cwd();
      const entries = readdirSync(path);
      const files: Array<{ name: string; type: 'file' | 'directory' }> = [];
      for (const entry of entries) {
        const fullPath = join(path, entry);
        const stats = statSync(fullPath);
        files.push({
          name: entry,
          type: stats.isDirectory() ? 'directory' : 'file'
        });
      }
      return files;
    });
  });
  tools.set('read_file', async (input) => {
    return wrapToolExecution(async () => {
      const filePath = input.file_path as string;
      if (!filePath) {
        throw new Error('file_path is required');
      }
      return readFileSync(filePath, 'utf-8');
    });
  });
  return tools;
}
