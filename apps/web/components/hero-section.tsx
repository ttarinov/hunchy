"use client"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ComputerTerminal01Icon,
  Copy01Icon,
  Tick01Icon,
} from "@hugeicons/core-free-icons"
import { AnimatedGrid } from "@/components/animated-grid"
import { useState } from "react"
export function HeroSection() {
  const [copied, setCopied] = useState(false)
  const installCommand = "curl -fsSL https://hunchy-4a0dc.web.app/install.sh | bash"
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(installCommand)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <AnimatedGrid />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6 animate-fade-in">
            <HugeiconsIcon icon={ComputerTerminal01Icon} size={12} className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">The Quality Layer for AI-Generated Code</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-balance animate-fade-in-up">
            AI writes it.{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">Hunchy makes it production-ready.</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty animate-fade-in-up animation-delay-200">
            From messy AI-generated code to clean, scalable, production-grade software.
            Automated refactoring, quality gates, and atomic commits before every merge.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
            <Button size="lg" className="shiny-cta w-48 group" asChild>
              <a href="#early-access">
                <span>Try for Free</span>
                <HugeiconsIcon icon={ArrowRight01Icon} size={20} className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </a>
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mt-6 animate-fade-in-up animation-delay-500">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border font-mono text-sm group">
              <span className="text-muted-foreground">$</span>{" "}
              <span className="text-secondary">curl</span>{" "}
              <span className="text-secondary">-fsSL</span>{" "}
              <span className="text-foreground">https://hunchy-4a0dc.web.app/install.sh</span>{" "}
              <span className="text-muted-foreground">|</span>{" "}
              <span className="text-primary">bash</span>
              <button
                onClick={handleCopy}
                className="ml-2 p-1 hover:bg-accent rounded transition-colors"
                aria-label="Copy install command"
              >
                {copied ? (
                  <HugeiconsIcon icon={Tick01Icon} size={16} className="h-4 w-4 text-green-500" />
                ) : (
                  <HugeiconsIcon icon={Copy01Icon} size={16} className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
