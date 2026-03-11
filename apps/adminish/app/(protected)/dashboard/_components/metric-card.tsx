"use client"
import type { LucideIcon } from "lucide-react"
type MetricCardProps = {
  title: string
  value: number | string
  icon: LucideIcon
  loading?: boolean
  description?: string
}
export function MetricCard({
  title,
  value,
  icon: Icon,
  loading = false,
  description,
}: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-md bg-muted" />
          ) : (
            <p className="text-3xl font-bold tracking-tight text-foreground">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          )}
          {description && (
            <p className="text-xs text-muted-foreground/70">{description}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
