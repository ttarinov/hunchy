"use client"
import * as React from "react"
import { SearchResult } from "./docs-search-index"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  File01Icon,
  CodeIcon,
  Settings01Icon,
  BookOpen01Icon,
  ComputerTerminal01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
interface DocsSearchResultProps {
  result: SearchResult
  onSelect?: () => void
  isSelected?: boolean
}
const categoryIcons: Record<string, IconSvgElement> = {
  "Getting Started": BookOpen01Icon,
  "Commands": ComputerTerminal01Icon,
  "Configuration": Settings01Icon,
  "Plugins": CodeIcon,
  "API Reference": File01Icon,
  "Examples": File01Icon,
}
function highlightText(text: string, matches: string[]): React.ReactNode {
  if (matches.length === 0) {
    return text
  }
  const normalizedText = text.toLowerCase()
  const parts: Array<{ text: string; isMatch: boolean }> = []
  let lastIndex = 0
  matches.forEach((match) => {
    const normalizedMatch = match.toLowerCase()
    let index = normalizedText.indexOf(normalizedMatch, lastIndex)
    while (index !== -1) {
      if (index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, index),
          isMatch: false,
        })
      }
      parts.push({
        text: text.substring(index, index + match.length),
        isMatch: true,
      })
      lastIndex = index + match.length
      index = normalizedText.indexOf(normalizedMatch, lastIndex)
    }
  })
  if (lastIndex < text.length) {
    parts.push({
      text: text.substring(lastIndex),
      isMatch: false,
    })
  }
  return parts.map((part, index) =>
    part.isMatch ? (
      <mark
        key={index}
        className="bg-primary/20 text-primary font-medium rounded px-0.5"
      >
        {part.text}
      </mark>
    ) : (
      <span key={index}>{part.text}</span>
    )
  )
}
export function DocsSearchResult({
  result,
  onSelect,
  isSelected,
}: DocsSearchResultProps) {
  const icon = categoryIcons[result.category] || File01Icon
  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors",
        isSelected
          ? "bg-primary/10 border border-primary/30"
          : "hover:bg-accent border border-transparent"
      )}
    >
      <div className="flex-shrink-0 mt-0.5">
        <HugeiconsIcon icon={icon} size={16} className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-semibold text-sm text-foreground">
            {highlightText(result.title, result.matches)}
          </h4>
          <span className="text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
            {result.category}
          </span>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">
          {highlightText(result.content.substring(0, 120), result.matches)}
          {result.content.length > 120 ? "..." : ""}
        </p>
      </div>
    </div>
  )
}
