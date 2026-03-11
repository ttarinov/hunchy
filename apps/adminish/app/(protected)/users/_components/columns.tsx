"use client"
import { ColumnDef } from "@tanstack/react-table"
import { UserWithStats } from "@/context/users-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, GitCommit, Crown, Zap, User, Calendar, Clock } from "lucide-react"
import { formatDate, formatRelativeTime } from "@/lib/utils"
function PlanBadge({ plan, isExpired }: { plan: string; isExpired: boolean }) {
  const config = {
    enterprise: {
      icon: Crown,
      label: "Enterprise",
      className: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    pro: {
      icon: Zap,
      label: "Pro",
      className: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    },
    free: {
      icon: User,
      label: "Free",
      className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    },
  }
  const { icon: Icon, label, className } = config[plan as keyof typeof config] || config.free
  if (isExpired) {
    return (
      <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/20 gap-1.5">
        <Icon className="h-3 w-3" />
        {label}
        <span className="text-red-500">(expired)</span>
      </Badge>
    )
  }
  return (
    <Badge variant="outline" className={`${className} gap-1.5`}>
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  )
}
export const columns: ColumnDef<UserWithStats>[] = [
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        Email
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-primary/20 to-primary/10 border border-primary/20">
          <span className="text-sm font-medium text-primary">
            {row.original.email.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="font-medium text-foreground">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "plan",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        Plan
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const plan = row.original.plan || "free"
      const isExpired = row.original.planExpiresAt && row.original.planExpiresAt < Date.now()
      return <PlanBadge plan={plan} isExpired={!!isExpired} />
    },
  },
  {
    accessorKey: "planExpiresAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <Calendar className="mr-2 h-3.5 w-3.5" />
        Expires
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const expiresAt = row.original.planExpiresAt
      if (!expiresAt || row.original.plan === "free") {
        return <span className="text-muted-foreground/50">-</span>
      }
      const isExpired = expiresAt < Date.now()
      const daysLeft = Math.ceil((expiresAt - Date.now()) / 86400000)
      return (
        <div className="flex flex-col">
          <span className={isExpired ? "text-red-400" : "text-foreground"}>
            {formatDate(expiresAt)}
          </span>
          {!isExpired && daysLeft <= 30 && (
            <span className="text-xs text-amber-400">{daysLeft} days left</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "commitsCount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <GitCommit className="mr-2 h-3.5 w-3.5" />
        Commits
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const count = row.original.commitsCount || 0
      return (
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-primary to-primary/70 rounded-full"
              style={{ width: `${Math.min((count / 1000) * 100, 100)}%` }}
            />
          </div>
          <span className="text-foreground tabular-nums">{count.toLocaleString()}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        Registered
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAt = row.original.createdAt
      if (!createdAt) return <span className="text-muted-foreground/50">-</span>
      return <span className="text-muted-foreground">{formatDate(createdAt)}</span>
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="-ml-4 text-muted-foreground hover:text-foreground hover:bg-transparent"
      >
        <Clock className="mr-2 h-3.5 w-3.5" />
        Last Active
        <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
      </Button>
    ),
    cell: ({ row }) => {
      const updatedAt = row.original.updatedAt
      if (!updatedAt) return <span className="text-muted-foreground/50">-</span>
      const isRecent = Date.now() - updatedAt < 3600000
      return (
        <span className={isRecent ? "text-emerald-400 flex items-center" : "text-muted-foreground"}>
          {isRecent && <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2" />}
          {formatRelativeTime(updatedAt)}
        </span>
      )
    },
  },
]
