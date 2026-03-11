import React, { useState } from 'react';
interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}
export const ChatInput: React.FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [input, setInput] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    setInput(target.value);
  };
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
      <input
        type="text"
        value={input}
        onChange={handleChange}
        placeholder="Type 'commit' to generate proposals..."
        disabled={disabled}
        style={{
          flex: 1,
          padding: '8px 12px',
          borderRadius: '4px',
          border: '1px solid var(--vscode-input-border)',
          backgroundColor: 'var(--vscode-input-background)',
          color: 'var(--vscode-input-foreground)',
          fontSize: '14px',
          outline: 'none'
        }}
      />
      <button
        type="submit"
        disabled={disabled || !input.trim()}
        style={{
          padding: '8px 16px',
          borderRadius: '4px',
          border: 'none',
          backgroundColor: disabled || !input.trim()
            ? 'var(--vscode-button-secondaryBackground)'
            : 'var(--vscode-button-background)',
          color: 'var(--vscode-button-foreground)',
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: 500
        }}
      >
        Send
      </button>
    </form>
  );
};
