"use client"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  GitCommitIcon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons"
export function MultiAgentExampleSection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-card/20 to-background pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              Massive changes split into{" "}
              <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                logical commits
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Whether from multiple agents or one large session, Hunchy automatically analyzes your changes
              and splits them into clean, atomic commits that tell a clear story.
            </p>
          </div>
          {}
          <div className="mb-12 grid md:grid-cols-3 gap-4">
            {[
              {
                task: "Building auth system",
                files: "lib/auth/, middleware/, components/auth/",
                fileCount: 12,
                additions: 240,
                deletions: 239,
                areas: ["OAuth flow", "Session management", "Login UI"]
              },
              {
                task: "Refactoring UI components",
                files: "components/, app/*/page.tsx",
                fileCount: 18,
                additions: 185,
                deletions: 162,
                areas: ["Component extraction", "Styling system", "Layout updates"]
              },
              {
                task: "Optimizing database",
                files: "lib/db/, migrations/, queries/",
                fileCount: 9,
                additions: 142,
                deletions: 98,
                areas: ["Query optimization", "Indexes", "Schema updates"]
              },
            ].map((agent, idx) => (
              <Card key={idx} className="border-border bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                {}
                <div className="bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-b border-blue-500/20 px-3 py-2 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <HugeiconsIcon icon={ComputerTerminal01Icon} size={12} className="h-3 w-3 text-blue-300" />
                  <span className="text-xs font-mono text-blue-300">Terminal {idx + 1}</span>
                </div>
                {}
                <div className="p-4 font-mono text-xs space-y-3">
                  <div className="text-foreground font-semibold text-sm mb-3">{agent.task}</div>
                  <div className="space-y-2">
                    <div className="text-muted-foreground">
                      <span className="text-[#f97316]">✽</span> claude code
                    </div>
                    <div className="pl-2 space-y-1 text-[11px]">
                      {agent.areas.map((area, i) => (
                        <div key={i} className="text-cyan-400">▸ {area}</div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-700/50 space-y-1">
                    <div className="text-white font-semibold text-md">
                      <span className="text-secondary">✓</span> {agent.fileCount} files <span className="text-green-400">+{agent.additions}</span> <span className="text-red-400">-{agent.deletions}</span>
                    </div>
                    <div className="text-muted-foreground text-[10px]">
                      {agent.files}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mb-12 text-center">
            <div className="inline-block px-6 py-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <div className="text-base md:text-lg">
                <span className="text-destructive font-bold">Without Hunchy:</span>
                <span className="text-foreground/80"> One massive commit with 567 lines across 39 files. Mixed concerns, hard to review, impossible to rollback.</span>
              </div>
            </div>
          </div>
          {}
          <Card className="p-8 border-secondary/30 bg-secondary/5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-lg bg-secondary/20 flex items-center justify-center">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} className="h-6 w-6 text-secondary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">With Hunchy: Clean Commits</h3>
                <p className="text-muted-foreground">All changes → Organized into logical commits</p>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { message: "feat(auth): implement OAuth2 flow", files: 8, additions: "+156", deletions: "-28" },
                { message: "feat(ui): enhance form components", files: 12, additions: "+87", deletions: "-15" },
                { message: "refactor(db): optimize query structure", files: 6, additions: "+142", deletions: "-98" },
                { message: "test(auth): add OAuth integration tests", files: 5, additions: "+94", deletions: "-8" },
                { message: "feat(api): add rate limiting middleware", files: 4, additions: "+45", deletions: "-12" },
                { message: "docs: update API documentation", files: 4, additions: "+42", deletions: "-3" },
              ].map((commit, idx) => (
                <Card key={idx} className="p-4 border-secondary/30 bg-background/50">
                  <div className="space-y-2">
                    <HugeiconsIcon icon={GitCommitIcon} size={16} className="h-4 w-4 text-secondary" />
                    <div className="font-mono text-xs text-secondary font-semibold break-words">
                      {commit.message}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      <span>{commit.files} files</span>{" "}
                      <span className="text-green-400">{commit.additions}</span>{" "}
                      <span className="text-red-400">{commit.deletions}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-secondary">6</div>
                <div className="text-xs text-muted-foreground">Atomic commits</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">39</div>
                <div className="text-xs text-muted-foreground">Files organized</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-secondary">100%</div>
                <div className="text-xs text-muted-foreground">Independently deployable</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
