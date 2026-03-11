"use client"
import { useState, useEffect } from "react"
import { MetricsBar } from "./metrics-bar"
import { PRCard } from "./pr-card"
import type { PR } from "./types"
type PRListProps = {
  prs?: PR[]
}
export function PRList({ prs: initialPRs }: PRListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  useEffect(() => {
    if (initialPRs && initialPRs.length > 0) {
      setExpandedItems(new Set([initialPRs[0]?.id.toString()]))
    }
  }, [initialPRs])
  const toggleItem = (id: string | number) => {
    const idStr = id.toString()
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(idStr)) {
      newExpanded.delete(idStr)
    } else {
      newExpanded.add(idStr)
    }
    setExpandedItems(newExpanded)
  }
  return (
    <div className="border border-secondary/30 bg-card/50 backdrop-blur-sm rounded-lg overflow-hidden">
      <MetricsBar prs={initialPRs} />
      <div className="p-6 space-y-3">
        {initialPRs && initialPRs.length > 0 ? (
          initialPRs.map((pr) => (
            <PRCard
              key={pr.id}
              pr={pr}
              isExpanded={expandedItems.has(pr.id.toString())}
              onToggle={() => toggleItem(pr.id)}
            />
          ))
        ) : (
          <div className="text-sm text-muted-foreground text-center py-8">No activity yet. Start using Hunchy CLI to see your commits and PRs here.</div>
        )}
      </div>
    </div>
  )
}
