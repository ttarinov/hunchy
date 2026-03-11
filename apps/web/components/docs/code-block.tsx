"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  Copy01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import { motion } from "framer-motion"
interface CodeBlockProps {
  code: string
  language?: string
  title?: string
  showTerminal?: boolean
}
export function CodeBlock({ code, language, title, showTerminal = true }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <Card className="bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-blue-500/30 shadow-xl shadow-blue-500/10 overflow-hidden">
      {showTerminal && (
        <div className="bg-linear-to-r from-blue-500/10 via-cyan-500/10 to-blue-500/10 border-b border-blue-500/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="flex items-center gap-2 text-blue-300">
              <HugeiconsIcon icon={ComputerTerminal01Icon} size={16} className="h-4 w-4" />
              <span className="text-sm font-mono">{title || "terminal"}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-blue-300 hover:text-blue-200 hover:bg-blue-500/20"
          >
            {copied ? (
              <>
                <HugeiconsIcon icon={Tick01Icon} size={12} className="h-3 w-3 mr-1" />
                Copied
              </>
            ) : (
              <>
                <HugeiconsIcon icon={Copy01Icon} size={12} className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      )}
      <div className="p-4">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap text-slate-300 overflow-x-auto">
          <code>{code}</code>
        </pre>
      </div>
    </Card>
  )
}
