"use client"
import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
interface DocsSectionProps {
  id: string
  title: string
  children: ReactNode
  className?: string
}
export function DocsSection({ id, title, children, className }: DocsSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={cn("scroll-mt-24 mb-16", className)}
    >
      <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6 bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
        {title}
      </h2>
      <div className="space-y-4 text-foreground">{children}</div>
    </motion.section>
  )
}
