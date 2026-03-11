"use client"
import { useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowRight01Icon,
  GitCommitIcon,
  GitPullRequestIcon,
} from "@hugeicons/core-free-icons"
export function DashboardSection() {
  const [expandedPRs, setExpandedPRs] = useState<Set<number>>(new Set([42]))
  const togglePR = (id: number) => {
    const newExpanded = new Set(expandedPRs)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedPRs(newExpanded)
  }
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-secondary/5 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Track every commit with <span className="text-secondary">precision</span>
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Beautiful dashboard to track commits, PRs, complexity, and time estimates
            </p>
          </div>
          {}
          <div className="border border-secondary/30 bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden">
            {}
            <div className="border-b border-border/50 px-6 py-4 bg-secondary/5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Commits:</span>
                    <span className="font-semibold text-secondary">24</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">PRs:</span>
                    <span className="font-semibold text-secondary">8</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Total Time:</span>
                    <span className="font-semibold text-secondary">42h</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">Last 7 days</span>
              </div>
            </div>
            <div className="p-6 space-y-3">
              {}
              <div className="border border-border/50 rounded-lg bg-background/50 overflow-hidden">
                <button
                  onClick={() => togglePR(42)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/5 transition-colors"
                >
                  {expandedPRs.has(42) ? (
                    <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <HugeiconsIcon icon={GitPullRequestIcon} size={16} className="h-4 w-4 text-secondary shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">PR #42: Authentication System</div>
                    <div className="text-xs text-muted-foreground">Added OAuth2, form validation, and middleware</div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>5 commits</span>
                    <span>12.5h</span>
                    <span className="text-secondary font-medium">Medium</span>
                  </div>
                </button>
                {expandedPRs.has(42) && (
                  <div className="px-4 pb-3 space-y-2 border-t border-border/50 pt-3 bg-secondary/5">
                    <div className="pl-7 space-y-2">
                      <div className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30">
                        <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">Add OAuth2 providers (Google, GitHub)</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>4.5h</span>
                            <span>Medium</span>
                            <span>3 files</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30">
                        <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">Implement form validation with Zod</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>3h</span>
                            <span>Low</span>
                            <span>2 files</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30">
                        <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">Add auth middleware for protected routes</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>2.5h</span>
                            <span>Low</span>
                            <span>2 files</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30">
                        <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">Create login/signup UI components</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>2h</span>
                            <span>Low</span>
                            <span>2 files</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30">
                        <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">Add session management and token refresh</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>0.5h</span>
                            <span>Low</span>
                            <span>1 file</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {}
              <div className="border border-border/50 rounded-lg bg-background/50 overflow-hidden">
                <button
                  onClick={() => togglePR(41)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/5 transition-colors"
                >
                  {expandedPRs.has(41) ? (
                    <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <HugeiconsIcon icon={GitPullRequestIcon} size={16} className="h-4 w-4 text-secondary shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">PR #41: Dashboard Components</div>
                    <div className="text-xs text-muted-foreground">
                      Built analytics dashboard with charts and metrics
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>8 commits</span>
                    <span>18h</span>
                    <span className="text-secondary font-medium">High</span>
                  </div>
                </button>
                {expandedPRs.has(41) && (
                  <div className="px-4 pb-3 space-y-2 border-t border-border/50 pt-3 bg-secondary/5">
                    <div className="pl-7 space-y-2">
                      <div className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30">
                        <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">Create dashboard layout and navigation</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>3h</span>
                            <span>Medium</span>
                            <span>4 files</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 py-2 px-3 rounded bg-background/70 border border-border/30">
                        <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium mb-1">Add analytics charts with Recharts</div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>6h</span>
                            <span>High</span>
                            <span>5 files</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {}
              <div className="border border-border/50 rounded-lg bg-background/50 overflow-hidden">
                <button
                  onClick={() => togglePR(40)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-secondary/5 transition-colors"
                >
                  {expandedPRs.has(40) ? (
                    <HugeiconsIcon icon={ArrowDown01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
                  ) : (
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="h-4 w-4 text-muted-foreground shrink-0" />
                  )}
                  <HugeiconsIcon icon={GitPullRequestIcon} size={16} className="h-4 w-4 text-secondary shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-sm">PR #40: API Integration</div>
                    <div className="text-xs text-muted-foreground">
                      Connected REST API with data fetching and caching
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>6 commits</span>
                    <span>9.5h</span>
                    <span className="text-secondary font-medium">Medium</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
