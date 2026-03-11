"use client"
import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { motion, AnimatePresence } from "framer-motion"
import { searchDocumentation, type SearchResult } from "./docs-search-index"
import { DocsSearchResult } from "./docs-search-result"
import { Card } from "@/components/ui/card"
import { useDebounce } from "@/hooks/use-debounce"
interface DocsSearchBarProps {
  onResultSelect?: (sectionId: string) => void
}
export function DocsSearchBar({ onResultSelect }: DocsSearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const searchResults = searchDocumentation(debouncedQuery, 8)
      setResults(searchResults)
      setIsOpen(true)
      setSelectedIndex(0)
    } else {
      setResults([])
      setIsOpen(false)
    }
  }, [debouncedQuery])
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        setQuery("")
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleEscape)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen])
  const handleSelect = (sectionId: string) => {
    setIsOpen(false)
    setQuery("")
    if (onResultSelect) {
      onResultSelect(sectionId)
    }
  }
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => Math.max(prev - 1, 0))
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault()
      handleSelect(results[selectedIndex].sectionId)
    }
  }
  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search documentation..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (results.length > 0) {
              setIsOpen(true)
            }
          }}
          className="pl-9 pr-9 h-10 text-sm bg-card border-border focus-visible:border-primary focus-visible:ring-primary/20 rounded-full"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              setIsOpen(false)
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={Cancel01Icon} size={16} className="h-4 w-4" />
          </button>
        )}
      </div>
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 z-50 w-[calc(100vw-2rem)] lg:w-[600px] lg:left-0 lg:right-auto max-w-[calc(100vw-2rem)] lg:max-w-[600px]"
          >
            <Card className="border-blue-500/30 bg-card shadow-xl max-h-[400px] overflow-y-auto">
              <div className="p-2 space-y-1">
                {results.map((result, index) => (
                  <DocsSearchResult
                    key={result.id}
                    result={result}
                    isSelected={index === selectedIndex}
                    onSelect={() => handleSelect(result.sectionId)}
                  />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
