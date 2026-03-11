"use client"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { BookOpen01Icon } from "@hugeicons/core-free-icons"
interface DocsHeroSectionProps {
  onSearchSelect?: (sectionId: string) => void
}
export function DocsHeroSection({ onSearchSelect }: DocsHeroSectionProps) {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6"
          >
            <HugeiconsIcon icon={BookOpen01Icon} size={12} className="h-3 w-3 text-primary" />
            <span className="text-xs font-medium text-primary">Documentation</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance"
          >
            Hunchy CLI{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">
              Documentation
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty"
          >
            Complete guide to using Hunchy CLI for intelligent commit management. Learn how to install, configure, and extend Hunchy in your projects.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
