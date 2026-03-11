export const SectionStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  DONE: 'done',
  ERROR: 'error',
  EXECUTED: 'executed'
} as const;
export type SectionStatus = typeof SectionStatus[keyof typeof SectionStatus];
export const ToolRequestStatus = {
  PENDING: 'pending',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;
export type ToolRequestStatus = typeof ToolRequestStatus[keyof typeof ToolRequestStatus];
export const MessageStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;
export type MessageStatus = typeof MessageStatus[keyof typeof MessageStatus];
export const CommitStep = {
  STAGING: 'staging',
  COMMITTING: 'committing',
  VERIFYING: 'verifying',
  DONE: 'done'
} as const;
export type CommitStep = typeof CommitStep[keyof typeof CommitStep];
export const SectionType = {
  AGENT: 'agent',
  TOOL_USE: 'tool_use',
  THINKING: 'thinking',
  COMMIT_DETAILS: 'commit_details',
  COMMIT_PROPOSAL: 'commit_proposal'
} as const;
export type SectionType = typeof SectionType[keyof typeof SectionType];
export const CommitType = {
  FEAT: 'feat',
  FIX: 'fix',
  REFACTOR: 'refactor',
  TEST: 'test',
  DOCS: 'docs',
  STYLE: 'style',
  CHORE: 'chore',
  PERF: 'perf'
} as const;
export type CommitType = typeof CommitType[keyof typeof CommitType];
export const Complexity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const;
export type Complexity = typeof Complexity[keyof typeof Complexity];
