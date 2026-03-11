"use client"
import * as React from "react"
import { useState, useEffect } from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
} from "@/components/ui/command"
import { searchDocumentation, type SearchResult } from "./docs-search-index"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  File01Icon,
  CodeIcon,
  Settings01Icon,
  BookOpen01Icon,
  ComputerTerminal01Icon,
} from "@hugeicons/core-free-icons"
interface DocsSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onResultSelect?: (sectionId: string) => void
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
export function DocsSearchModal({
  open,
  onOpenChange,
  onResultSelect,
}: DocsSearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = searchDocumentation(query, 15)
      setResults(searchResults)
    } else {
      setResults([])
    }
  }, [query])
  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
    }
  }, [open])
  const handleSelect = (sectionId: string) => {
    onOpenChange(false)
    if (onResultSelect) {
      onResultSelect(sectionId)
    }
  }
  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>
  )
  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Search Documentation"
      description="Search through Hunchy CLI documentation"
    >
      <CommandInput
        placeholder="Search documentation..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {Object.entries(groupedResults).map(([category, categoryResults]) => {
          const icon = categoryIcons[category] || File01Icon
          return (
            <CommandGroup key={category} heading={category}>
              {categoryResults.map((result) => (
                <CommandItem
                  key={result.id}
                  value={result.id}
                  onSelect={() => handleSelect(result.sectionId)}
                  className="flex items-start gap-3 py-3"
                >
                  <HugeiconsIcon icon={icon} size={16} className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">
                      {highlightText(result.title, result.matches)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {highlightText(
                        result.content.substring(0, 100),
                        result.matches
                      )}
                      {result.content.length > 100 ? "..." : ""}
                    </p>
                  </div>
                  <CommandShortcut>↵</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}
      </CommandList>
    </CommandDialog>
  )
}
