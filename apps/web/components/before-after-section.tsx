"use client"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileScriptIcon,
  GitCommitIcon,
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  SparklesIcon,
  GitBranchIcon,
} from "@hugeicons/core-free-icons"
export function BeforeAfterSection() {
  const beforeFeatures = [
    { name: "Auth system", files: 8, lines: "+456", desc: "OAuth, sessions, middleware" },
    { name: "UI redesign", files: 12, lines: "+623", desc: "Components, styles, layouts" },
    { name: "Database optimization", files: 6, lines: "+389", desc: "Queries, indexes, migrations" },
    { name: "Payment integration", files: 15, lines: "+734", desc: "Stripe, webhooks, validation" },
    { name: "API endpoints", files: 9, lines: "+512", desc: "Routes, handlers, types" },
  ]
  const afterCommits = [
    {
      branch: "feature/auth-system",
      commits: 3,
      files: 8,
      description: "OAuth, sessions, middleware"
    },
    {
      branch: "feature/ui-redesign",
      commits: 4,
      files: 12,
      description: "Components, styles, layouts"
    },
    {
      branch: "feature/db-optimization",
      commits: 2,
      files: 6,
      description: "Queries, indexes, migrations"
    },
    {
      branch: "feature/payment-integration",
      commits: 5,
      files: 15,
      description: "Stripe, webhooks, validation"
    },
    {
      branch: "feature/api-endpoints",
      commits: 3,
      files: 9,
      description: "Routes, handlers, types"
    }
  ]
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          {}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-secondary/30 bg-secondary/10 mb-6">
              <HugeiconsIcon icon={SparklesIcon} size={16} className="h-4 w-4 text-secondary" />
              <span className="text-sm font-medium text-secondary">Real Tuesday Afternoon Session</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              From velocity <span className="text-secondary">chaos</span> to clarity
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              2.5 hours of AI-assisted coding. 2,714 lines changed. 50 files modified. 5 features mixed together.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {}
            <Card className="border-destructive/30 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="bg-card/80 border-b border-destructive/20 px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">before</span>
                  <div className="ml-auto flex items-center gap-1.5 text-destructive/80">
                    <HugeiconsIcon icon={AlertCircleIcon} size={14} className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Messy</span>
                  </div>
                </div>
                {}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-destructive">1</div>
                    <div className="text-xs text-muted-foreground">Commit</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">50</div>
                    <div className="text-xs text-muted-foreground">Files</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-destructive">2,714</div>
                    <div className="text-xs text-muted-foreground">Lines</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <div className="font-mono text-xs space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">$</span>
                    <span>git status</span>
                  </div>
                  <div className="text-destructive/80 text-xs">50 files modified, 2,714 lines changed:</div>
                </div>
                <div className="space-y-1.5">
                  {beforeFeatures.map((feature, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded bg-destructive/5 border border-destructive/10 font-mono text-xs"
                    >
                      <div className="text-foreground/90 font-semibold mb-2">{feature.name} ({feature.files} files)</div>
                      <div className="text-muted-foreground text-[10px]">
                        {feature.lines} lines: {feature.desc}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-destructive/20">
                  <div className="font-mono text-xs space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-primary">$</span>
                      <span>git commit -m "tuesday updates"</span>
                    </div>
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center gap-2 text-destructive/80">
                        <HugeiconsIcon icon={AlertCircleIcon} size={14} className="h-3.5 w-3.5" />
                        <span className="text-xs">Impossible to review</span>
                      </div>
                      <div className="flex items-center gap-2 text-destructive/80">
                        <HugeiconsIcon icon={AlertCircleIcon} size={14} className="h-3.5 w-3.5" />
                        <span className="text-xs">Can't deploy parts independently</span>
                      </div>
                      <div className="flex items-center gap-2 text-destructive/80">
                        <HugeiconsIcon icon={AlertCircleIcon} size={14} className="h-3.5 w-3.5" />
                        <span className="text-xs">Can't revert if one feature breaks</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="border-secondary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
              <div className="bg-card/80 border-b border-secondary/20 px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-500/40" />
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">after hunchy</span>
                  <div className="ml-auto flex items-center gap-1.5 text-secondary">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="h-3.5 w-3.5" />
                    <span className="text-xs font-medium">Clean</span>
                  </div>
                </div>
                {}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl font-bold text-secondary">17</div>
                    <div className="text-xs text-muted-foreground">Commits</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">5</div>
                    <div className="text-xs text-muted-foreground">Branches</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary">2,714</div>
                    <div className="text-xs text-muted-foreground">Lines</div>
                  </div>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="font-mono text-xs space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">$</span>
                    <span>hunchy organize</span>
                  </div>
                  <div className="text-secondary text-xs">Analyzing 2,714 lines across 50 files...</div>
                </div>
                {afterCommits.map((commit, idx) => (
                  <Card
                    key={idx}
                    className="border-secondary/30 bg-secondary/5 overflow-hidden hover:border-secondary/50 transition-all duration-300"
                  >
                    <div className="p-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={GitBranchIcon} size={12} className="h-3 w-3 text-secondary" />
                        <span className="text-xs font-mono text-secondary/90 font-semibold">{commit.branch}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground">{commit.description}</div>
                      <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={GitCommitIcon} size={12} className="h-3 w-3 text-secondary" />
                          <span>{commit.commits} commits</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={FileScriptIcon} size={12} className="h-3 w-3 text-secondary" />
                          <span>{commit.files} files</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                <div className="pt-3 border-t border-secondary/20">
                  <div className="flex items-center gap-2 text-secondary text-xs">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="h-4 w-4" />
                    <span className="font-medium">5 feature branches, 17 semantic commits</span>
                  </div>
                  <div className="mt-2 space-y-1 text-[10px] text-muted-foreground">
                    <div>✓ Each feature independently deployable</div>
                    <div>✓ Granular rollback control</div>
                    <div>✓ Clean review process</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
