export interface ToolApprovalRequest {
  toolName: string;
  input: Record<string, unknown>;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  userResponse?: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface ToolApprovalData extends ToolApprovalRequest {
  _key: string;
}
