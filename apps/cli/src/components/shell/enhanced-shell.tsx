import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { useChatState } from '../context/chat-context.js';
import { useChatIntegration } from '../../hooks/useChatIntegration.js';
import { useFirebaseMessages } from '../../hooks/useFirebaseMessages.js';
import { useToolRequests } from '../../hooks/useToolRequests.js';
import { useToolApprovals } from '../../hooks/useToolApprovals.js';
import { useCommands } from '../../hooks/useCommands.js';
import { useCommitExecution } from '../../hooks/use-commit-execution.js';
import { useMessageFiltering } from '../../hooks/use-message-filtering.js';
import { MessageStream } from './message-stream.js';
import { AutocompleteInput } from './autocomplete-input.js';
import { ThinkingSpinner } from '../ui/spinner.js';
import { CommitApproval } from '../commit/commit-approval.js';
import { ToolApproval } from '../commit/tool-approval.js';
import { UsageDisplay } from '../usage/usage-display.js';
import { convertProposalsToCommits } from '../../utils/commit/proposal-converter.js';
import { clearScreen } from '../../utils/terminal.js';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
import { MessageStatus, SectionStatus, SectionType } from '../../types/enums.js';
import gradient from 'gradient-string';
interface EnhancedShellProps {
  onExit?: () => void;
  onCommandStart?: () => void;
  onCommandEnd?: () => void;
}
export function EnhancedShell({ onExit, onCommandStart, onCommandEnd }: EnhancedShellProps) {
  const app = useApp();
  const {
    setChatId,
    setProcessing,
    setApproval,
    setCurrentMessage,
    setSections,
    isProcessing,
    isInApproval
  } = useChatState();
  const { chatId, sendMessage, getState } = useChatIntegration();
  const { getCommand, getSuggestions } = useCommands();
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [commandResult, setCommandResult] = useState<any>(null);
  const [showCommitSuccess, setShowCommitSuccess] = useState(false);
  const [showUsage, setShowUsage] = useState(false);
  const [usageData, setUsageData] = useState<any>(null);
  const [isUsageLoading, setIsUsageLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const state = getState();
  const { executeCommits } = useCommitExecution({
    database: state?.database || null,
    messagesPath: state?.messagesPath || undefined,
    userId: state?.userId || undefined,
    setSections,
    setProcessing,
    setError,
    setShowCommitSuccess,
    setCurrentMessage
  });
  const { messages } = useFirebaseMessages(
    state?.database || null,
    chatId,
    state?.userId ?? undefined,
    state?.messagesPath ?? undefined
  );
  useToolRequests(
    state?.database || null,
    chatId,
    state?.userId ?? undefined,
    state?.messagesPath ?? undefined
  );

  const { pendingApprovals, approveRequest, rejectRequest } = useToolApprovals(
    state?.database || null,
    chatId,
    state?.userId ?? undefined,
    state?.messagesPath ?? undefined
  );

  const suggestions = getSuggestions(input);
  useEffect(() => {
    if (chatId) {
      setChatId(chatId);
    }
    if (messages.length > 0) {
      const latestMessage = messages[messages.length - 1];
      setCurrentMessage(latestMessage);
      const hasPending = messages.some(m => m.status === MessageStatus.PENDING);
      setProcessing(hasPending);
    }
  }, [chatId, messages, setChatId, setCurrentMessage, setProcessing]);
  useInput((input, key) => {
    if (key.ctrl && input === 'c') {
      app.exit();
      if (onExit) onExit();
    }
    if (key.escape) {
      if (isProcessing) {
        setProcessing(false);
        setInput('');
      } else if (shouldShowToolApproval) {
        handleToolReject();
      } else if (isInApproval || shouldShowApproval) {
        setApproval(false);
      } else {
        setInput('');
      }
    }
    if ((key.meta || key.ctrl) && (key.backspace || key.delete)) {
      if (!isProcessing && !isInApproval && !shouldShowApproval) {
        setInput('');
      }
    }
  }, { isActive: true });
  const latestMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
  const hasExecutingTools = latestMessage?.sections?.some(section => 
    section.type === SectionType.TOOL_USE && 
    section.metadata?.status === SectionStatus.RUNNING
  ) || false;
  const showSpinner = isProcessing || hasExecutingTools;
  const commitProposals = useMemo(() => {
    if (!latestMessage?.sections) return [];
    return latestMessage.sections.filter(s => 
      s.type === SectionType.COMMIT_PROPOSAL && 
      !s.metadata?.approved && 
      s.metadata?.status !== SectionStatus.EXECUTED
    );
  }, [latestMessage]);
  const parsedCommits = useMemo(() => {
    if (commitProposals.length === 0) return [];
    return convertProposalsToCommits(commitProposals);
  }, [commitProposals]);
  const shouldShowApproval = commitProposals.length > 0 && !isInApproval && !showSpinner;
  const shouldShowToolApproval = pendingApprovals.length > 0 && !showSpinner && !shouldShowApproval;

  const handleToolApprove = async () => {
    if (pendingApprovals.length === 0) return;
    const approval = pendingApprovals[0];
    try {
      await approveRequest(approval.messageId, approval.approvalId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to approve: ${errorMsg}`);
    }
  };

  const handleToolReject = async () => {
    if (pendingApprovals.length === 0) return;
    const approval = pendingApprovals[0];
    try {
      await rejectRequest(approval.messageId, approval.approvalId, 'User rejected');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Failed to reject: ${errorMsg}`);
    }
  };

  const handleApprove = async () => {
    const commitsToExecute = [...parsedCommits];
    const latestMessage = messages.length > 0 ? messages[messages.length - 1] : undefined;
    const preservedSections = latestMessage?.sections || [];
    setApproval(false);
    setProcessing(true);
    setError(null);
    await executeCommits(commitsToExecute, latestMessage, preservedSections);
  };
  const handleReject = () => {
    setApproval(false);
    setCurrentMessage(null);
  };
  const handleSubmit = async (value: string) => {
    if (!value.trim() || isProcessing || isInApproval || isSubmitting) return;
    setIsSubmitting(true);
    setInput('');
    setError(null);
    setCommandResult(null);
    setShowCommitSuccess(false);
    if (value.startsWith('/')) {
      clearScreen();
      onCommandStart?.();
      const parts = value.slice(1).trim().split(/\s+/);
      const commandName = parts[0];
      const args = parts.slice(1);
      const command = getCommand(commandName);
      if (command) {
        try {
          if (commandName === 'usage') {
            setShowUsage(true);
            setUsageData(null);
            setIsUsageLoading(true);
          }
          const result = await command.handler(args, {});
          if (commandName === 'usage') {
            setUsageData(result);
            setIsUsageLoading(false);
          } else {
            setCommandResult(result);
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : String(err);
          setError(errorMsg);
          if (commandName === 'usage') {
            setShowUsage(false);
            setIsUsageLoading(false);
          }
        }
      } else {
        setError(`Unknown command: /${commandName}. Type /help for available commands.`);
      }
      onCommandEnd?.();
      setIsSubmitting(false);
      return;
    }
    setProcessing(true);
    try {
      await sendMessage(value);
    } catch (err) {
      setProcessing(false);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };
  const filteredMessages = useMessageFiltering({
    messages
  });
  if (showUsage) {
    return (
      <UsageDisplay
        usageData={usageData}
        isLoading={isUsageLoading}
        onExit={() => {
          setShowUsage(false);
          setUsageData(null);
          setIsUsageLoading(false);
        }}
      />
    );
  }
  return (
    <Box flexDirection="column">
      {error && (
        <Box marginBottom={1}>
          <Text color="red">✗ {error}</Text>
        </Box>
      )}
      {commandResult && (
        <Box flexDirection="column" marginBottom={1}>
          {commandResult.success === false ? (
            <>
              <Text color="red">✗ {commandResult.message}</Text>
              {commandResult.error && (
                <Text color="gray">   {commandResult.error}</Text>
              )}
              {commandResult.hint && (
                <Text color="gray">   {commandResult.hint}</Text>
              )}
            </>
          ) : commandResult.commands ? (
            <>
              <Text color="cyan">{'\n'}Available commands:{'\n'}</Text>
              {commandResult.commands.map((cmd: any, idx: number) => (
                <Text key={idx}>
                  <Text color="cyan">  {cmd.name}</Text>
                  <Text color="gray"> - {cmd.description}</Text>
                </Text>
              ))}
            </>
          ) : commandResult.message ? (
            <>
              <Text color="green">✓ {commandResult.message}</Text>
              {commandResult.email && (
                <Text color="gray">   Email: <Text color="cyan">{commandResult.email}</Text></Text>
              )}
              {commandResult.userId && (
                <Text color="gray">   User ID: <Text color="cyan">{commandResult.userId}</Text></Text>
              )}
            </>
          ) : null}
        </Box>
      )}
      {filteredMessages.map(({ message, sections: messageSections }, index) => {
        if (!message.content && messageSections.length === 0) {
          return null;
        }
        const isLatest = message.id === latestMessage?.id;
        const uniqueKey = message.id || `msg-${message.createdAt}-${index}`;
        return (
          <MessageStream 
            key={uniqueKey} 
            message={message} 
            sections={messageSections}
            isLatest={isLatest}
            hideProposalsDuringApproval={isInApproval}
          />
        );
      })}
      {showSpinner && <ThinkingSpinner />}
      {showCommitSuccess && (
        <Box marginTop={1} marginBottom={1}>
          <Text bold>
            {gradient(['#10b981', '#059669', '#047857'])('✓ All committed')}
          </Text>
        </Box>
      )}
      {shouldShowToolApproval && (
        <ToolApproval
          approval={pendingApprovals[0]}
          onApprove={handleToolApprove}
          onReject={handleToolReject}
        />
      )}
      {shouldShowApproval && !shouldShowToolApproval && (
        <CommitApproval
          commits={parsedCommits}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      {!isInApproval && !showSpinner && !shouldShowApproval && !shouldShowToolApproval && (
        <AutocompleteInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          suggestions={suggestions}
        />
      )}
    </Box>
  );
}
