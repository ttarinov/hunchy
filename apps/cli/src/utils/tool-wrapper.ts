import type { ToolResult } from '../types/tool.js';
import { getErrorMessage } from './error-utils.js';
export function wrapToolExecution<T>(
  fn: () => Promise<T>
): Promise<ToolResult> {
  return fn()
    .then(result => ({
      success: true,
      result
    }))
    .catch(error => ({
      success: false,
      error: getErrorMessage(error)
    }));
}
