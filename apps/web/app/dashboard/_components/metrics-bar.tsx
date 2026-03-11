import { HugeiconsIcon } from "@hugeicons/react"
import { GitBranchIcon } from "@hugeicons/core-free-icons"
import type { PR } from "./types"
type MetricsBarProps = {
  prs?: PR[]
}
export function MetricsBar({ prs = [] }: MetricsBarProps) {
  const totalCommits = prs.reduce((sum, pr) => sum + pr.commits.length, 0)
  return (
    <div className="border-b border-border/50 px-6 py-4 bg-secondary/5">
      <div className="flex items-center justify-between text-sm flex-wrap gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Potential Commits:</span>
            <span className="font-semibold">100</span>
            <span className="text-muted-foreground">→</span>
            <span className="font-semibold text-secondary">500</span>
          </div>
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={GitBranchIcon} size={16} className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Branches:</span>
            <span className="font-semibold text-secondary">40</span>
          </div>
          {prs.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">PRs:</span>
              <span className="font-semibold text-secondary">{prs.length}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Commits:</span>
            <span className="font-semibold text-secondary">{totalCommits}</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">All time</span>
      </div>
    </div>
  )
}
