"use client"
import { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Menu01Icon,
  Cancel01Icon,
  Rocket01Icon,
  ComputerTerminal01Icon,
  Settings01Icon,
  CodeIcon,
  BookOpen01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { DocsSearchBar } from "./docs-search-bar"
interface SidebarItem {
  id: string
  title: string
  icon?: IconSvgElement
  items?: Array<{
    id: string
    title: string
  }>
}
const sidebarItems: SidebarItem[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: Rocket01Icon,
    items: [
      { id: "installation", title: "Installation" },
      { id: "quick-start", title: "Quick Start" },
    ],
  },
  {
    id: "commands",
    title: "Commands",
    icon: ComputerTerminal01Icon,
    items: [
      { id: "init", title: "hunchy init" },
      { id: "commit", title: "hunchy commit" },
      { id: "interactive-shell", title: "Interactive Shell" },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: Settings01Icon,
    items: [
      { id: "config-file", title: "Config File" },
      { id: "config-options", title: "Options" },
      { id: "config-examples", title: "Examples" },
    ],
  },
  {
    id: "api-reference",
    title: "API Reference",
    icon: CodeIcon,
    items: [
      { id: "command-registry", title: "CommandRegistry" },
      { id: "file-scanner", title: "FileScanner" },
      { id: "git-analyzer", title: "GitAnalyzer" },
    ],
  },
  {
    id: "examples",
    title: "Examples",
    icon: BookOpen01Icon,
    items: [
      { id: "common-use-cases", title: "Common Use Cases" },
      { id: "workflow-examples", title: "Workflows" },
    ],
  },
]
interface DocsSidebarProps {
  activeSection?: string
  onSectionChange?: (sectionId: string) => void
  onSearchSelect?: (sectionId: string) => void
}
export function DocsSidebar({ activeSection, onSectionChange, onSearchSelect }: DocsSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeId, setActiveId] = useState(activeSection || "installation")
  useEffect(() => {
    if (activeSection) {
      setActiveId(activeSection)
    }
  }, [activeSection])
  const handleClick = (id: string) => {
    setActiveId(id)
    setIsOpen(false)
    if (onSectionChange) {
      onSectionChange(id)
    }
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }
  return (
    <>
      <div className="lg:hidden fixed top-16 left-0 right-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-sm font-medium">Documentation</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden"
          >
            {isOpen ? <HugeiconsIcon icon={Cancel01Icon} size={16} className="h-4 w-4" /> : <HugeiconsIcon icon={Menu01Icon} size={16} className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <aside
        className={cn(
          "fixed top-0 left-0 h-screen w-64 border-r border-border bg-card/95 backdrop-blur-sm z-30 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "pt-16 lg:pt-20"
        )}
      >
        <ScrollArea className="h-full">
          <div className="p-4">
            <DocsSearchBar onResultSelect={onSearchSelect} />
          </div>
          <nav className="p-4 space-y-1">
            {sidebarItems.map((section) => (
              <div key={section.id} className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2 px-2 flex items-center gap-2">
                  {section.icon && <HugeiconsIcon icon={section.icon} size={16} className="h-4 w-4" />}
                  {section.title}
                </h3>
                {section.items && (
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => handleClick(item.id)}
                          className={cn(
                            "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                            activeId === item.id
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {item.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </nav>
        </ScrollArea>
      </aside>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
