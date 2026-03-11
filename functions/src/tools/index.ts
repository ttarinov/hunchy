import { ToolDefinition } from "../services/ToolExecutionService";
export const GIT_TOOLS: ToolDefinition[] = [
  {
    name: 'git_status',
    description: 'Get the current status of the git repository, including staged, modified, and untracked files',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'git_diff',
    description: 'Get the full unified diff of all changes in the repository',
    input_schema: {
      type: 'object',
      properties: {
        staged: {
          type: 'boolean',
          description: 'Get diff of staged changes only',
          default: false
        }
      }
    }
  },
  {
    name: 'git_diff_file',
    description: 'Get detailed diff for a specific file',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the file relative to repo root'
        }
      },
      required: ['file_path']
    }
  },
  {
    name: 'git_log',
    description: 'Get recent commit history to understand commit message patterns',
    input_schema: {
      type: 'object',
      properties: {
        count: {
          type: 'number',
          description: 'Number of commits to retrieve',
          default: 10
        }
      }
    }
  },
  {
    name: 'git_show_file',
    description: 'Show file content at a specific revision',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the file'
        },
        revision: {
          type: 'string',
          description: 'Git revision (e.g., HEAD, main, commit hash)'
        }
      },
      required: ['file_path']
    }
  },
  {
    name: 'git_commit',
    description: 'Create a git commit with the specified message and files. Requires user approval.',
    input_schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'Commit message in conventional commits format: type(scope): description'
        },
        files: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of file paths to include in this commit'
        },
        type: {
          type: 'string',
          enum: ['feat', 'fix', 'refactor', 'test', 'docs', 'style', 'chore', 'perf'],
          description: 'Commit type'
        },
        scope: {
          type: 'string',
          description: 'Commit scope (optional)'
        },
        description: {
          type: 'string',
          description: 'Brief explanation of what this commit does and why'
        }
      },
      required: ['message', 'files', 'type']
    },
    requires_approval: true
  }
];
export const FILESYSTEM_TOOLS: ToolDefinition[] = [
  {
    name: 'list_files',
    description: 'List files and directories in a given path',
    input_schema: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Path to list (default: current directory)',
          default: '.'
        }
      }
    }
  },
  {
    name: 'read_file',
    description: 'Read the contents of a file',
    input_schema: {
      type: 'object',
      properties: {
        file_path: {
          type: 'string',
          description: 'Path to the file'
        }
      },
      required: ['file_path']
    }
  }
];
export const ALL_TOOLS: ToolDefinition[] = [
  ...GIT_TOOLS,
  ...FILESYSTEM_TOOLS
];
export const AGENT_ALLOWED_TOOLS: string[] = [
  'git_status',
  'git_diff',
  'git_diff_file',
  'git_log',
  'git_show_file',
  'git_commit',
  'list_files',
  'read_file'
];
