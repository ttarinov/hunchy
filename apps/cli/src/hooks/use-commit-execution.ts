import { useState, useCallback } from 'react';
import type { ParsedCommit } from '../utils/commit/commit-parser.js';
import type { CollapsibleSection } from '../types/collapsible-section.js';
import { CommitExecutor } from '../services/commit-executor.js';
import type { Database } from 'firebase/database';
import { updateMessageSections } from '../utils/firebase-helpers.js';
import { generateCommitId } from '../utils/id-generator.js';
import type { CommitExecutionDetails } from '../types/commit.js';
import { SectionStatus, CommitStep } from '../types/enums.js';
import { getErrorMessage } from '../utils/error-utils.js';
interface UseCommitExecutionOptions {
  database: Database | null;
  messagesPath: string | undefined;
  userId: string | undefined;
  setSections: (sections: CollapsibleSection[]) => void;
  setProcessing: (processing: boolean) => void;
  setError: (error: string | null) => void;
  setShowCommitSuccess: (show: boolean) => void;
  setCurrentMessage: (message: any) => void;
}
export function useCommitExecution({
  database,
  messagesPath,
  userId,
  setSections,
  setProcessing,
  setError,
  setShowCommitSuccess,
  setCurrentMessage
}: UseCommitExecutionOptions) {
  const [executedCommitMessageIds, setExecutedCommitMessageIds] = useState<Set<string>>(new Set());
  const executeCommits = useCallback(async (
    commits: ParsedCommit[],
    latestMessage: any,
    preservedSections: CollapsibleSection[]
  ) => {
    const messageId = latestMessage?.id;
    if (messageId) {
      setExecutedCommitMessageIds((prev: Set<string>) => new Set(prev).add(messageId));
    }
    const updatedPreservedSections = preservedSections.map((section) => {
      if (section.type === 'commit_proposal') {
        return {
          ...section,
          metadata: {
            ...section.metadata,
            approved: true,
            status: SectionStatus.EXECUTED
          }
        };
      }
      return section;
    });
    setSections(updatedPreservedSections);
    if (messageId && database && messagesPath) {
      try {
        await updateMessageSections(database, messagesPath, messageId, updatedPreservedSections);
      } catch (err) {
        console.warn('Failed to update message sections:', err);
      }
    }
    try {
      const executor = new CommitExecutor();
      const commitResults: Array<{ commit: ParsedCommit; hash: string }> = [];
      const commitSections: CollapsibleSection[] = [];
      for (let i = 0; i < commits.length; i++) {
        const commit = commits[i];
        const commitSection: CollapsibleSection = {
          id: generateCommitId(i),
          type: 'commit_details',
          title: `${i + 1}. ${commit.message}`,
          summary: `Creating commit ${i + 1}/${commits.length}...`,
          details: {
            step: CommitStep.STAGING,
            files: commit.files,
            commands: [`git add ${commit.files.join(' ')}`],
            message: commit.message
          } as CommitExecutionDetails,
          metadata: {
            status: SectionStatus.RUNNING
          }
        };
        commitSections.push(commitSection);
        const currentSections = [...updatedPreservedSections, ...commitSections];
        setSections(currentSections);
        if (messageId && database && messagesPath) {
          try {
            await updateMessageSections(database, messagesPath, messageId, currentSections);
          } catch (err) {
            console.warn('Failed to update message sections:', err);
          }
        }
        await new Promise(resolve => setTimeout(resolve, 200));
        commitSection.details = {
          step: CommitStep.COMMITTING,
          files: commit.files,
          commands: [
            `git add ${commit.files.join(' ')}`,
            `git commit -m "${commit.message}"`
          ],
          message: commit.message
        } as CommitExecutionDetails;
        commitSection.summary = `Creating commit ${i + 1}/${commits.length}...`;
        setSections([...updatedPreservedSections, ...commitSections]);
        if (messageId && database && messagesPath) {
          try {
            await updateMessageSections(database, messagesPath, messageId, [...updatedPreservedSections, ...commitSections]);
          } catch (err) {
            console.warn('Failed to update message sections:', err);
          }
        }
        const result = await executor.executeCommit(commit);
        if (!result.success) {
          commitSection.metadata = { status: SectionStatus.ERROR };
          commitSection.summary = `✗ Failed to create commit ${i + 1}`;
          setSections([...updatedPreservedSections, ...commitSections]);
          setError(`Failed to create commit ${i + 1}: ${result.error}`);
          setProcessing(false);
          return;
        }
        commits[i] = result.commit;
        if (result.hash) {
          commitResults.push({ commit: result.commit, hash: result.hash });
          commitSection.details = {
            step: CommitStep.DONE,
            files: commit.files,
            commands: [
              `git add ${commit.files.join(' ')}`,
              `git commit -m "${commit.message}"`
            ],
            hash: result.hash,
            message: commit.message
          } as CommitExecutionDetails;
          commitSection.metadata = { status: SectionStatus.DONE };
          commitSection.title = `${i + 1}. ${commit.message}`;
          commitSection.summary = `✓ Commit ${i + 1}/${commits.length} created`;
        }
        setSections([...updatedPreservedSections, ...commitSections]);
        if (messageId && database && messagesPath) {
          try {
            await updateMessageSections(database, messagesPath, messageId, [...updatedPreservedSections, ...commitSections]);
          } catch (err) {
            console.warn('Failed to update message sections:', err);
          }
        }
        if (userId) {
          executor.notifyCommitRecorded(userId).catch(err => {
            console.warn('Failed to track commit:', err);
          });
        }
        if (i < commits.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      const finalSections = [...updatedPreservedSections, ...commitSections];
      setSections(finalSections);
      if (messageId && database && messagesPath) {
        try {
          await updateMessageSections(database, messagesPath, messageId, finalSections);
        } catch (err) {
          console.warn('Failed to update message sections:', err);
        }
      }
      const verified = await executor.verifyCommits(commits);
      if (!verified) {
        setError('Warning: Some commits may not have been created correctly');
        setProcessing(false);
        return;
      }
      setProcessing(false);
      await new Promise(resolve => setTimeout(resolve, 100));
      setShowCommitSuccess(true);
      setTimeout(() => {
        setShowCommitSuccess(false);
      }, 12000);
      if (latestMessage) {
        setCurrentMessage(latestMessage);
      }
    } catch (error) {
      setError(getErrorMessage(error, 'Failed to execute commits'));
      setProcessing(false);
      setShowCommitSuccess(false);
    }
  }, [database, messagesPath, userId, setSections, setProcessing, setError, setShowCommitSuccess, setCurrentMessage]);
  return {
    executedCommitMessageIds,
    executeCommits
  };
}
