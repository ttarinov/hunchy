import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  GitCommitIcon,
  GitPullRequestIcon,
} from "@hugeicons/core-free-icons"
import type { PR } from "./types"
type PRCardProps = {
  pr: PR
  isExpanded: boolean
  onToggle: () => void
}
export function PRCard({ pr, isExpanded, onToggle }: PRCardProps) {
  return (
    <div className="border border-border/50 rounded-lg bg-background/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/5 transition-colors"
      >
        {isExpanded ? (
          <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <HugeiconsIcon icon={GitPullRequestIcon} size={16} className="h-4 w-4 text-secondary shrink-0" />
        <div className="flex-1 text-left">
          <div className="font-semibold text-sm">PR #{pr.id}: {pr.title}</div>
          <div className="text-xs text-muted-foreground">{pr.description}</div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{pr.commits.length} commits</span>
          <span>{pr.totalTime}</span>
          <span className="text-secondary font-medium">{pr.complexity}</span>
        </div>
      </button>
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2 border-t border-border/50 pt-3 bg-secondary/5">
          <div className="pl-7 space-y-2">
            {pr.commits.map((commit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30"
              >
                <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium mb-1">{commit.title}</div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{commit.time}</span>
                    <span>{commit.complexity}</span>
                    <span>{commit.files} {commit.files === 1 ? "file" : "files"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
