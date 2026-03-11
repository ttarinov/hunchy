import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
import { ToolSection } from './tool-section.js';
import { ThinkingSection } from './thinking-section.js';
import { CommitSection } from './commit-section.js';
import { ProposalSection } from './proposal-section.js';
import { SectionStatus, SectionType } from '../../types/enums.js';
interface TreeViewProps {
  sections: CollapsibleSection[];
  isActive?: boolean;
  messageId?: string;
  hideExecutedProposals?: boolean;
  hideProposalsDuringApproval?: boolean;
}
function filterSections(
  sections: CollapsibleSection[],
  hideExecutedProposals: boolean,
  hideProposalsDuringApproval: boolean
): CollapsibleSection[] {
  const hasCommitDetails = sections.some(s => s.type === SectionType.COMMIT_DETAILS);
  return sections.filter(section => {
    if (section.type === SectionType.COMMIT_PROPOSAL) {
      if (hasCommitDetails) {
        return false;
      }
      if (hideProposalsDuringApproval) return false;
      if (hideExecutedProposals) {
        return section.metadata?.status !== SectionStatus.EXECUTED;
      }
    }
    return true;
  });
}
export function TreeView({ 
  sections, 
  isActive = false, 
  messageId,
  hideExecutedProposals = true,
  hideProposalsDuringApproval = false
}: TreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const visibleSections = filterSections(
    sections,
    hideExecutedProposals,
    hideProposalsDuringApproval
  );
  useInput((input, key) => {
    if (key.ctrl && input === 'o') {
      const allExpanded = expandedIds.size === visibleSections.length && visibleSections.length > 0;
      if (allExpanded) {
        setExpandedIds(new Set());
      } else {
        setExpandedIds(new Set(visibleSections.map(s => s.id)));
      }
    }
  }, { isActive });
  const toggleSection = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  if (visibleSections.length === 0) return null;
  const tools = visibleSections.filter(s => s.type === SectionType.TOOL_USE);
  const running = tools.filter(t => t.metadata?.status === SectionStatus.RUNNING);
  return (
    <Box flexDirection="column">
      {visibleSections.map((section, index) => {
        const isExpanded = expandedIds.has(section.id);
        const isLast = index === visibleSections.length - 1;
        const uniqueKey = messageId ? `${messageId}-${section.id}` : section.id;
        if (section.type === SectionType.TOOL_USE) {
          return (
            <ToolSection
              key={uniqueKey}
              section={section}
              isExpanded={isExpanded}
              isLast={isLast}
              onToggle={() => toggleSection(section.id)}
            />
          );
        }
        if (section.type === SectionType.THINKING) {
          return (
            <ThinkingSection
              key={uniqueKey}
              section={section}
              isExpanded={isExpanded}
              isLast={isLast}
              onToggle={() => toggleSection(section.id)}
            />
          );
        }
        if (section.type === SectionType.COMMIT_DETAILS) {
          return (
            <CommitSection
              key={uniqueKey}
              section={section}
              isExpanded={isExpanded}
              isLast={isLast}
              onToggle={() => toggleSection(section.id)}
            />
          );
        }
        if (section.type === SectionType.COMMIT_PROPOSAL) {
          return (
            <ProposalSection
              key={uniqueKey}
              section={section}
              isExpanded={isExpanded}
              isLast={isLast}
              onToggle={() => toggleSection(section.id)}
            />
          );
        }
        return null;
      })}
    </Box>
  );
}
