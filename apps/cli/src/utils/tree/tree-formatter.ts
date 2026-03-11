import chalk from "chalk";
import type { CollapsibleSection } from "../../types/collapsible-section.js";
import type { ToolUseDetails } from "../../types/commit.js";
import { SectionStatus } from "../../types/enums.js";
export function formatSummary(section: CollapsibleSection, isFocused: boolean): string {
  const parts: string[] = [];
  if (section.type === "agent") {
    parts.push(chalk.white(section.title));
  } else {
    parts.push(chalk.white(section.summary));
  }
  if (section.metadata) {
    const metaParts: string[] = [];
    if (section.metadata.toolCount) {
      metaParts.push(`${section.metadata.toolCount} tool use${section.metadata.toolCount > 1 ? "s" : ""}`);
    }
    if (section.metadata.tokens) {
      metaParts.push(`${(section.metadata.tokens / 1000).toFixed(1)}k tokens`);
    }
    if (section.metadata.status) {
      const status = section.metadata.status;
      const statusText = status.charAt(0).toUpperCase() + status.slice(1);
      const statusColor = status === SectionStatus.RUNNING ? chalk.yellow :
                          status === SectionStatus.DONE ? chalk.green :
                          chalk.gray;
      metaParts.push(statusColor(statusText));
    }
    if (metaParts.length > 0) {
      parts.push(chalk.gray(" · " + metaParts.join(" · ")));
    }
  }
  return parts.join("");
}
export function formatToolTitle(tool: CollapsibleSection): string {
  let toolTitle = tool.title;
  const toolDetails = tool.details as ToolUseDetails | undefined;
  if (toolDetails && 'input' in toolDetails && toolDetails.input) {
    const input = toolDetails.input;
    if (tool.title === 'git_diff_file' && input.file_path) {
      toolTitle = `git_diff_file(${input.file_path})`;
    } else if (tool.title === 'git_show_file' && input.file_path) {
      const revision = input.revision ? `@${input.revision}` : '';
      toolTitle = `git_show_file(${input.file_path}${revision})`;
    } else if (tool.title === 'git_log' && input.count) {
      toolTitle = `git_log(count: ${input.count})`;
    } else if ((tool.title === 'Read' || tool.title === 'read_file') && (input.file_path || input.target_file)) {
      const filePath = input.file_path || input.target_file;
      toolTitle = `Read(${filePath})`;
    }
  }
  return toolTitle;
}
export function formatStatusText(tool: CollapsibleSection): string {
  let statusText = tool.summary;
  if (statusText.includes("✓")) {
    statusText = statusText.replace(/✓\s*[^:]*:\s*/, '').trim();
  }
  if (statusText.toLowerCase().includes('executing') || statusText.toLowerCase().includes('completed')) {
    return '';
  }
  return statusText;
}
