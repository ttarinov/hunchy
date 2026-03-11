"use client"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  FlashIcon,
  GitCommitIcon,
} from "@hugeicons/core-free-icons"
const outputs = {
  basic: `🔍 Analyzing 247 lines across 8 files...
✨ Generated 3 semantic commits
📦 Commit 1/3: feat(auth): implement OAuth2 flow
   Files: lib/api/auth.ts, middleware.ts
   +156 -28 | Quality: High | Complexity: Medium
📦 Commit 2/3: feat(ui): enhance form components
   Files: components/auth/LoginForm.tsx, components/ui/*
   +87 -15 | Quality: High | Complexity: Low
📦 Commit 3/3: test(auth): add OAuth integration tests
   Files: tests/auth.test.ts
   +94 -8 | Quality: High | Complexity: Medium
✅ All commits created successfully`,
  detailed: `🔍 Analyzing 247 lines across 8 files...
✨ Generated 3 semantic commits
📦 Commit 1/3: feat(auth): implement OAuth2 flow
   Files: lib/api/auth.ts, middleware.ts
   +156 -28 | Quality: High | Complexity: Medium
   Description:
   Adds OAuth2 authentication with Google and GitHub providers.
   Implements JWT token validation and secure session management.
📦 Commit 2/3: feat(ui): enhance form components
   Files: components/auth/LoginForm.tsx, components/ui/*
   +87 -15 | Quality: High | Complexity: Low
   Description:
   Improves form validation and error handling.
   Adds loading states and accessibility features.
📦 Commit 3/3: test(auth): add OAuth integration tests
   Files: tests/auth.test.ts
   +94 -8 | Quality: High | Complexity: Medium
   Description:
   Adds comprehensive test coverage for OAuth flow.
   Includes unit and integration tests.
✅ All commits created successfully`,
}
function formatTerminalOutput(output: string) {
  return output.split("\n").map((line, i) => {
    if (line.startsWith("✓") || line.startsWith("✅")) {
      return <div key={i} className="mb-1 text-green-400">{line}</div>
    }
    if (line.match(/^━+$/)) {
      return <div key={i} className="my-3 text-blue-500/30">{line}</div>
    }
    if (line.match(/^(feat|fix|test|refactor|docs|style|chore)\(/)) {
      return <div key={i} className="mb-1 text-blue-300 font-bold">{line}</div>
    }
    if (line.match(/\d+[mh] ago\s+(feat|fix|test|refactor|docs|style|chore)\(/)) {
      const parts = line.split(/\s+(feat|fix|test|refactor|docs|style|chore)/)
      return (
        <div key={i} className="mb-1 text-slate-300">
          <span>{parts[0]}</span>
          <span className="text-blue-300 font-bold"> {parts.slice(1).join("")}</span>
        </div>
      )
    }
    if (line.startsWith("📦 Commit") || line.startsWith("📦 Total") || line.startsWith("📦")) {
      if (line.includes(":") && line.match(/feat|fix|test|refactor|docs|style|chore/)) {
        const colonIndex = line.indexOf(":")
        const beforeColon = line.substring(0, colonIndex + 1)
        const afterColon = line.substring(colonIndex + 1).trim()
        return (
          <div key={i} className="mb-1">
            <span className="text-cyan-400 font-semibold">{beforeColon}</span>
            {afterColon.match(/^(feat|fix|test|refactor|docs|style|chore)\(/) ? (
              <span className="text-blue-300 font-bold"> {afterColon}</span>
            ) : (
              <span className="text-slate-300"> {afterColon}</span>
            )}
          </div>
        )
      }
      return <div key={i} className="mb-1 text-cyan-400 font-semibold">{line}</div>
    }
    if (line.startsWith("🔍") || line.startsWith("✨") || line.startsWith("📊") || line.startsWith("🎯") || line.startsWith("📝") || line.startsWith("🔖") || line.startsWith("📖") || line.startsWith("🎨") || line.startsWith("🧠") || line.startsWith("🔒") || line.startsWith("📚") || line.startsWith("⚡") || line.startsWith("🐛") || line.startsWith("💡") || line.startsWith("🚀") || line.startsWith("⏱️") || line.startsWith("📈") || line.startsWith("🏆")) {
      return <div key={i} className="mb-1 text-cyan-400 font-semibold">{line}</div>
    }
    if (line.startsWith("-") || line.startsWith("•")) {
      return <div key={i} className="mb-1 text-slate-300">{line}</div>
    }
    if (line.startsWith("Files:") || line.startsWith("   Files:")) {
      return <div key={i} className="mb-1 text-slate-400 text-xs">{line}</div>
    }
    if (line.match(/^\s+\+\d+\s+-\d+/)) {
      return <div key={i} className="mb-1 text-slate-400 text-xs">{line}</div>
    }
    if (line.match(/Quality:|Complexity:|Code Quality:|Performance Impact:|Breaking Changes:|Potential Issues:|Test Coverage:/)) {
      return <div key={i} className="mb-1 text-slate-400 text-xs">{line}</div>
    }
    if (line.match(/^\s+\d+\./)) {
      return <div key={i} className="mb-1 text-slate-300">{line}</div>
    }
    if (line.match(/^\d+\.\s+@/)) {
      return <div key={i} className="mb-1 text-slate-300">{line}</div>
    }
    if (line.match(/Server running/)) {
      return <div key={i} className="mb-1 text-green-400">{line}</div>
    }
    if (line.trim() === "") {
      return <div key={i} className="h-1" />
    }
    return <div key={i} className="mb-1 text-slate-400">{line}</div>
  })
}
function TerminalCard({ title, command, output, icon }: { title: string; command: string; output: string; icon: IconSvgElement }) {
  return (
    <Card className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-blue-500/30 shadow-2xl shadow-blue-500/10 overflow-hidden">
      <div className="bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-b border-blue-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="flex items-center gap-2 text-blue-300">
            <HugeiconsIcon icon={icon} size={16} className="h-4 w-4" />
            <span className="text-sm font-mono">{title}</span>
          </div>
        </div>
      </div>
      <div className="p-6 font-mono text-sm min-h-[400px] max-h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
        <div className="mb-6">
          <p className="text-slate-400">
            $ <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">hunchy</span> {command}
          </p>
        </div>
        <div className="border-t border-blue-500/20 pt-4">
          <pre className="text-sm leading-relaxed whitespace-pre-wrap">
            {formatTerminalOutput(output)}
          </pre>
        </div>
      </div>
    </Card>
  )
}
export function CodeExampleSection() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-card/20 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-linear-to-r from-blue-500/10 to-cyan-500/10 mb-6">
              <HugeiconsIcon icon={ComputerTerminal01Icon} size={16} className="h-4 w-4 bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" />
              <span className="text-sm font-medium bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">CLI Examples</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Powerful CLI, <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">beautiful results</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple commands that deliver intelligent insights
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TerminalCard
              title="hunchy-cli"
              command="commit"
              output={outputs.basic}
              icon={FlashIcon}
            />
            <TerminalCard
              title="hunchy-cli"
              command="commit"
              output={outputs.detailed}
              icon={GitCommitIcon}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
