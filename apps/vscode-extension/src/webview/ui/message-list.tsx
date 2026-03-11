import React from 'react';
import { Message } from '../../types';
interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}
export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading }) => {
  if (messages.length === 0 && !isLoading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '40px 20px',
        color: 'var(--vscode-descriptionForeground)'
      }}>
        <p>Type "commit" to generate commit proposals from your changes</p>
      </div>
    );
  }
  return (
    <div>
      {messages.map((message) => (
        <div
          key={message.id}
          style={{
            marginBottom: '16px',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: message.role === 'user'
              ? 'var(--vscode-button-background)'
              : 'var(--vscode-input-background)',
            color: message.role === 'user'
              ? 'var(--vscode-button-foreground)'
              : 'var(--vscode-foreground)',
            maxWidth: '80%',
            marginLeft: message.role === 'user' ? 'auto' : '0',
            marginRight: message.role === 'user' ? '0' : 'auto'
          }}
        >
          <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
            {message.content}
          </div>
          {message.status === 'error' && (
            <div style={{
              marginTop: '8px',
              padding: '8px',
              borderRadius: '4px',
              backgroundColor: 'var(--vscode-inputValidation-errorBackground)',
              color: 'var(--vscode-errorForeground)',
              fontSize: '12px'
            }}>
              {message.content}
            </div>
          )}
        </div>
      ))}
      {isLoading && (
        <div style={{
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: 'var(--vscode-input-background)',
          color: 'var(--vscode-foreground)',
          maxWidth: '80%'
        }}>
          <div style={{ fontSize: '14px' }}>Analyzing changes and generating proposals...</div>
        </div>
      )}
    </div>
  );
};
