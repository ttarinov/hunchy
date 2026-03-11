"use client"
import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  GitCommitIcon,
  CheckmarkCircle01Icon,
  File01Icon,
  Clock01Icon,
  FlashIcon,
} from "@hugeicons/core-free-icons"
import { DotsSpinner } from "@/components/ui/dots-spinner"
import { cn } from "@/lib/utils"
interface ParsedCommit {
  number: number
  total: number
  type: string 
  message: string
  bullets: string[]
  files: string[]
  hash: string
}
interface ParsedOutput {
  summary: {
    filesAnalyzed: number
    changes: number
    boundaries: number
  } | null
  commits: ParsedCommit[]
  finalSummary: {
    totalCommits: number
    filesChanged: number
    additions: number
  } | null
}
const thinkingSteps = [
  "Analyzing repository structure...",
  "Reading uncommitted changes...",
  "Detecting logical boundaries...",
  "Splitting into semantic commits...",
]
const commitOutput = `✓ Analyzed 8 files with 247 changes
✓ Detected 3 logical commit boundaries
📦 Splitting changes into commits...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ICON] Commit 1 of 3
feat(auth): Add OAuth2 authentication system
- Implemented OAuth2 flow with Google & GitHub providers
- Added JWT token management and refresh logic
- Created secure session handling middleware
Files: src/auth/oauth.ts, src/auth/tokens.ts, src/middleware/auth.ts
✓ Commit created (a3f9c2b)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ICON] Commit 2 of 3
feat(ui): Add login and signup forms
- Created responsive login form with validation
- Added signup flow with email verification
- Integrated OAuth buttons with new auth system
Files: src/components/LoginForm.tsx, src/components/SignupForm.tsx
✓ Commit created (b7e4d1a)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ICON] Commit 3 of 3
test(auth): Add comprehensive auth tests
- Added OAuth flow integration tests
- Created unit tests for token management
- Added E2E tests for login/signup flows
Files: src/auth/__tests__/oauth.test.ts, src/auth/__tests__/tokens.test.ts
✓ Commit created (c9a1f3e)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Successfully created 3 semantic commits
📊 Total: 8 files changed, 247 additions`
function parseCommitOutput(output: string): ParsedOutput {
  const result: ParsedOutput = {
    summary: null,
    commits: [],
    finalSummary: null,
  }
  if (!output) return result
  const lines = output.split("\n")
  let i = 0
  while (i < lines.length) {
    const line = lines[i]?.trim()
    if (!line) {
      i++
      continue
    }
    if (line.includes("✓ Analyzed")) {
      const analyzedMatch = line.match(/✓ Analyzed (\d+) files with (\d+) changes/)
      if (analyzedMatch) {
        i++
        while (i < lines.length) {
          const nextLine = lines[i]?.trim()
          if (nextLine?.includes("✓ Detected")) {
            const boundariesMatch = nextLine.match(/✓ Detected (\d+) logical commit boundaries/)
            if (boundariesMatch) {
              result.summary = {
                filesAnalyzed: parseInt(analyzedMatch[1]),
                changes: parseInt(analyzedMatch[2]),
                boundaries: parseInt(boundariesMatch[1]),
              }
              i++
              break
            }
          }
          i++
        }
        break
      }
    }
    i++
  }
  while (i < lines.length) {
    const line = lines[i]?.trim()
    if (line?.match(/^━+$/)) {
      i++
      break
    }
    i++
  }
  while (i < lines.length) {
    const line = lines[i]?.trim()
    if (!line) {
      i++
      continue
    }
    const commitMatch = line.match(/\[ICON\] Commit (\d+) of (\d+)/)
    if (commitMatch) {
      const commitNumber = parseInt(commitMatch[1])
      const totalCommits = parseInt(commitMatch[2])
      i++
      const messageLine = lines[i]?.trim()
      if (!messageLine) {
        i++
        continue
      }
      const messageMatch = messageLine.match(/^(\w+)\(([^)]+)\):\s*(.+)$/)
      if (!messageMatch) {
        i++
        continue
      }
      const commitType = messageMatch[1]
      const message = messageLine
      i++
      if (lines[i]?.trim() === "") i++
      const bullets: string[] = []
      while (i < lines.length && lines[i]?.trim().startsWith("-")) {
        const bullet = lines[i].trim().substring(1).trim()
        if (bullet) bullets.push(bullet)
        i++
      }
      if (lines[i]?.trim() === "") i++
      const files: string[] = []
      if (lines[i]?.trim().startsWith("Files:")) {
        const filesLine = lines[i].substring(6).trim()
        if (filesLine) {
          files.push(...filesLine.split(",").map((f) => f.trim()).filter(Boolean))
        }
        i++
      }
      if (lines[i]?.trim() === "") i++
      let hash = ""
      if (lines[i]?.includes("✓ Commit created")) {
        const hashMatch = lines[i].match(/✓ Commit created \(([a-f0-9]+)\)/)
        if (hashMatch) {
          hash = hashMatch[1]
        }
        i++
      }
      result.commits.push({
        number: commitNumber,
        total: totalCommits,
        type: commitType,
        message,
        bullets,
        files,
        hash,
      })
      while (i < lines.length && lines[i]?.trim().match(/^━+$/)) {
        i++
      }
    } else if (line?.includes("✨ Successfully created")) {
      const commitsMatch = line.match(/✨ Successfully created (\d+) semantic commits/)
      if (commitsMatch) {
        i++
        while (i < lines.length) {
          const nextLine = lines[i]?.trim()
          if (nextLine?.includes("📊 Total:")) {
            const totalMatch = nextLine.match(/📊 Total: (\d+) files changed, (\d+) additions/)
            if (totalMatch) {
              result.finalSummary = {
                totalCommits: parseInt(commitsMatch[1]),
                filesChanged: parseInt(totalMatch[1]),
                additions: parseInt(totalMatch[2]),
              }
              break
            }
          }
          i++
        }
        break
      }
      i++
    } else {
      i++
    }
  }
  return result
}
function SummarySection({ summary }: { summary: ParsedOutput["summary"] }) {
  if (!summary) return null
  return (
    <div className="space-y-2 mb-6">
      <div className="flex items-center gap-2 text-green-400">
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="h-4 w-4" />
        <span>Analyzed {summary.filesAnalyzed} files with {summary.changes} changes</span>
      </div>
      <div className="flex items-center gap-2 text-green-400">
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={16} className="h-4 w-4" />
        <span>Detected {summary.boundaries} logical commit boundaries</span>
      </div>
      <div className="flex items-center gap-2 text-cyan-400 font-semibold mt-3">
        <span>📦</span>
        <span>Splitting changes into commits...</span>
      </div>
    </div>
  )
}
function CommitCard({ commit }: { commit: ParsedCommit }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "feat":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "fix":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      case "test":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "refactor":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }
  return (
    <Card className="bg-slate-800/50 border-blue-500/20 mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HugeiconsIcon icon={GitCommitIcon} size={20} className="h-5 w-5 text-blue-400" />
            <Badge variant="outline" className="bg-blue-500/10 text-blue-300 border-blue-500/30">
              Commit {commit.number} of {commit.total}
            </Badge>
            <Badge variant="outline" className={getTypeColor(commit.type)}>
              {commit.type}
            </Badge>
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-blue-300 font-bold text-base">{commit.message}</h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {commit.bullets.length > 0 && (
          <ul className="space-y-1.5">
            {commit.bullets.map((bullet, idx) => (
              <li key={idx} className="text-slate-300 flex items-start gap-2">
                <span className="text-blue-400 mt-1">-</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
        {commit.files.length > 0 && (
          <div className="flex items-start gap-2 text-slate-400 text-xs">
            <HugeiconsIcon icon={File01Icon} size={14} className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold">Files: </span>
              <span>{commit.files.join(", ")}</span>
            </div>
          </div>
        )}
        {commit.hash && (
          <div className="flex items-center gap-2 text-green-400 text-xs pt-2 border-t border-slate-700/50">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="h-3.5 w-3.5" />
            <span>Commit created ({commit.hash})</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
function FinalSummary({ summary }: { summary: ParsedOutput["finalSummary"] }) {
  if (!summary) return null
  return (
    <div className="mt-6 pt-4 border-t border-green-500/20 space-y-2">
      <div className="flex items-center gap-2 text-cyan-400 font-semibold">
        <span>✨</span>
        <span>Successfully created {summary.totalCommits} semantic commits</span>
      </div>
      <div className="flex items-center gap-2 text-slate-300">
        <span>📊</span>
        <span>Total: {summary.filesChanged} files changed, {summary.additions} additions</span>
      </div>
    </div>
  )
}
export function CliDemoSection() {
  const [displayedOutput, setDisplayedOutput] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [thinkingStep, setThinkingStep] = useState(0)
  const [showThinking, setShowThinking] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!isRunning) return
    if (showThinking && thinkingStep < thinkingSteps.length) {
      const timer = setTimeout(() => {
        setThinkingStep((prev) => prev + 1)
      }, 600)
      return () => clearTimeout(timer)
    }
    if (showThinking && thinkingStep === thinkingSteps.length && displayedOutput.length === 0) {
      const timer = setTimeout(() => {
        setShowThinking(false)
      }, 400)
      return () => clearTimeout(timer)
    }
    if (!showThinking && displayedOutput.length < commitOutput.length) {
      const timer = setTimeout(() => {
        setDisplayedOutput(commitOutput.slice(0, displayedOutput.length + 3))
      }, 8)
      return () => clearTimeout(timer)
    }
  }, [displayedOutput, isRunning, showThinking, thinkingStep])
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [displayedOutput, thinkingStep])
  const startDemo = () => {
    setDisplayedOutput("")
    setThinkingStep(0)
    setShowThinking(true)
    setIsRunning(true)
  }
  const resetDemo = () => {
    setDisplayedOutput("")
    setThinkingStep(0)
    setShowThinking(false)
    setIsRunning(false)
  }
  return (
    <section className="py-0 relative overflow-visible -mt-12">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-5xl mx-auto">
          {}
          <Card className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-blue-500/30 shadow-2xl shadow-blue-500/10 overflow-hidden">
            {}
            <div className="bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-b border-blue-500/20 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="flex items-center gap-2 text-blue-300">
                  <HugeiconsIcon icon={ComputerTerminal01Icon} size={16} className="h-4 w-4" />
                  <span className="text-sm font-mono">hunchy-cli</span>
                </div>
              </div>
              <button
                onClick={isRunning ? resetDemo : startDemo}
                className="px-3 py-1 text-xs font-mono bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded border border-blue-500/30 transition-colors"
              >
                {isRunning ? "Reset" : "Run Demo"}
              </button>
            </div>
            {}
            <div ref={terminalRef} className="p-6 font-mono text-sm min-h-[500px] max-h-[600px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-blue-500/20 scrollbar-track-transparent">
              {!isRunning && (
                <div className="text-slate-400">
                  <p className="mb-2">$ <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">hunchy</span> commit</p>
                  <p className="text-slate-500 text-xs mt-4">Click "Run Demo" to see the AI agent in action</p>
                </div>
              )}
              {isRunning && (
                <>
                  <div className="mb-6">
                    <p className="text-slate-400">
                      $ <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">hunchy</span> commit
                    </p>
                  </div>
                  {}
                  {showThinking && (
                    <div className="mb-4 flex items-center gap-3">
                      <DotsSpinner />
                      <span className="bg-linear-to-r from-blue-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent font-semibold">
                        {thinkingSteps[Math.min(thinkingStep, thinkingSteps.length - 1)]}
                      </span>
                    </div>
                  )}
                  {}
                  {!showThinking && displayedOutput && (
                    <div className="border-t border-blue-500/20 pt-4">
                      {(() => {
                        const parsed = parseCommitOutput(displayedOutput)
                        return (
                          <div className="space-y-4">
                            {parsed.summary && <SummarySection summary={parsed.summary} />}
                            {parsed.summary && parsed.commits.length > 0 && (
                              <Separator className="bg-blue-500/20 my-4" />
                            )}
                            {parsed.commits.map((commit) => (
                              <div key={commit.number}>
                                <CommitCard commit={commit} />
                                {commit.number < commit.total && (
                                  <Separator className="bg-blue-500/20 my-4" />
                                )}
                              </div>
                            ))}
                            {parsed.finalSummary && (
                              <>
                                <Separator className="bg-blue-500/20 my-4" />
                                <FinalSummary summary={parsed.finalSummary} />
                                <div className="mt-6 pt-4 border-t border-green-500/20">
                                  <div className="flex items-center gap-2 text-green-400">
                                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5" />
                                    <span className="text-sm font-semibold">All commits created! Ready to push to remote.</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
