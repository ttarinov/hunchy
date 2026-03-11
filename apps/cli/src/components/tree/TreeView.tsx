import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import type { CollapsibleSection } from '../../types/collapsible-section.js';
import { ToolSection } from './ToolSection.js';
import { ThinkingSection } from './thinking-section.js';
import { CommitSection } from './commit-section.js';
interface TreeViewProps {
  sections: CollapsibleSection[];
}
export function TreeView({ sections }: TreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  useInput((input, key) => {
    if (key.ctrl && input === 'o') {
      const allExpanded = expandedIds.size === visibleSections.length && visibleSections.length > 0;
      if (allExpanded) {
        setExpandedIds(new Set());
      } else {
        setExpandedIds(new Set(visibleSections.map(s => s.id)));
      }
    }
  }, { isActive: true });
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
  const visibleSections = sections.filter(s => s.type !== 'commit_proposal');
  if (visibleSections.length === 0) return null;
  const tools = visibleSections.filter(s => s.type === 'tool_use');
  const running = tools.filter(t => t.metadata?.status === 'running');
  return (
    <Box flexDirection="column">
      {visibleSections.map((section, index) => {
        const isExpanded = expandedIds.has(section.id);
        const isLast = index === visibleSections.length - 1;
        if (section.type === 'tool_use') {
          return (
            <ToolSection
              key={section.id}
              section={section}
              isExpanded={isExpanded}
              isLast={isLast}
              onToggle={() => toggleSection(section.id)}
            />
          );
        }
        if (section.type === 'thinking') {
          return (
            <ThinkingSection
              key={section.id}
              section={section}
              isExpanded={isExpanded}
              isLast={isLast}
              onToggle={() => toggleSection(section.id)}
            />
          );
        }
        if (section.type === 'commit_details') {
          return (
            <CommitSection
              key={section.id}
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
