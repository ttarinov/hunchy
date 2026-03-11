import React from 'react';
import { CommitProposal } from '../../types';
interface CommitProposalListProps {
  proposals: CommitProposal[];
  onApprove: (proposal: CommitProposal) => void;
  onReject: (proposal: CommitProposal) => void;
}
export const CommitProposalList: React.FC<CommitProposalListProps> = ({
  proposals,
  onApprove,
  onReject
}) => {
  if (proposals.length === 0) {
    return null;
  }
  return (
    <div style={{ marginTop: '24px' }}>
      <h3 style={{
        fontSize: '16px',
        fontWeight: 600,
        marginBottom: '16px',
        color: 'var(--vscode-foreground)'
      }}>
        Commit Proposals ({proposals.length})
      </h3>
      {proposals.map((proposal, index) => (
        <div
          key={index}
          style={{
            marginBottom: '16px',
            padding: '16px',
            borderRadius: '6px',
            border: '1px solid var(--vscode-panel-border)',
            backgroundColor: 'var(--vscode-editor-background)'
          }}
        >
          <div style={{
            marginBottom: '12px',
            paddingBottom: '12px',
            borderBottom: '1px solid var(--vscode-panel-border)'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--vscode-textLink-foreground)',
              marginBottom: '4px'
            }}>
              {proposal.scope
                ? `${proposal.type}(${proposal.scope}): ${proposal.message}`
                : `${proposal.type}: ${proposal.message}`
              }
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--vscode-descriptionForeground)',
              marginTop: '4px'
            }}>
              {proposal.description}
            </div>
          </div>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--vscode-foreground)',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Files ({proposal.files.length})
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              maxHeight: '150px',
              overflowY: 'auto',
              padding: '8px',
              backgroundColor: 'var(--vscode-input-background)',
              borderRadius: '4px'
            }}>
              {proposal.files.map((file, fileIndex) => (
                <div
                  key={fileIndex}
                  style={{
                    fontSize: '12px',
                    fontFamily: 'var(--vscode-editor-font-family)',
                    color: 'var(--vscode-foreground)',
                    padding: '2px 0'
                  }}
                >
                  {file}
                </div>
              ))}
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'flex-end'
          }}>
            <button
              onClick={() => onReject(proposal)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: '1px solid var(--vscode-button-secondaryBackground)',
                backgroundColor: 'transparent',
                color: 'var(--vscode-foreground)',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(proposal)}
              style={{
                padding: '6px 12px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'var(--vscode-button-background)',
                color: 'var(--vscode-button-foreground)',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              Approve & Commit
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
