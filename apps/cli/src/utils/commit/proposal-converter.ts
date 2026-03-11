import type { CollapsibleSection, CommitProposalData } from '../../types/collapsible-section.js';
import type { ParsedCommit } from './commit-parser.js';
import { SectionType } from '../../types/enums.js';
export function convertProposalsToCommits(proposals: CollapsibleSection[]): ParsedCommit[] {
  return proposals
    .filter(section => section.type === SectionType.COMMIT_PROPOSAL)
    .map((section, index) => {
      const details = section.details as CommitProposalData | undefined;
      const metadata = section.metadata;
      const messageMatch = section.title.match(/^(\w+)\(([^)]+)\):\s*(.+)$/);
      const type = messageMatch ? messageMatch[1] : (metadata?.proposalType || 'chore');
      const scope = messageMatch ? messageMatch[2] : (metadata?.scope || '');
      const message = messageMatch ? messageMatch[3] : section.summary;
      const files = details && Array.isArray(details.files) ? details.files : [];
      let description: string[] = [];
      if (details && Array.isArray(details.description)) {
        description = details.description;
      } else if (details?.description) {
        description = typeof details.description === 'string' 
          ? [details.description] 
          : Array.isArray(details.description) 
            ? details.description.flat() 
            : [section.summary];
      } else {
        description = [section.summary];
      }
      const complexity = metadata?.complexity 
        ? metadata.complexity.charAt(0).toUpperCase() + metadata.complexity.slice(1)
        : 'Medium';
      return {
        number: index + 1,
        total: proposals.filter(s => s.type === SectionType.COMMIT_PROPOSAL).length,
        type,
        message: `${type}(${scope}): ${message}`,
        bullets: description,
        files,
        complexity,
        timeEstimate: '', 
        hash: '' 
      };
    });
}
