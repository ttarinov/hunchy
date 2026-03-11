"use client"
import { useCommits } from "@/context/commits-context"
import { useUsers } from "@/context/users-context"
import { AgentsActivityTable } from "./_components/agents-activity-table"
import { MetricCard } from "../dashboard/_components/metric-card"
import { GitCommit, Users, TrendingUp, Calendar } from "lucide-react"
export default function AgentsPage() {
  const { commits, totalCommits, commitsToday, commitsThisWeek, loading: commitsLoading } = useCommits()
  const { users, loading: usersLoading } = useUsers()
  const loading = commitsLoading || usersLoading
  const usersWithCommits = users.filter((user) =>
    commits.some((c) => c.userId === user._key)
  ).length
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Agents Activity
        </h1>
        <p className="text-muted-foreground">
          Monitor commit activity across all users
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Commits"
          value={totalCommits}
          icon={GitCommit}
          loading={loading}
          description="All time"
        />
        <MetricCard
          title="Active Developers"
          value={usersWithCommits}
          icon={Users}
          loading={loading}
          description="With commits"
        />
        <MetricCard
          title="Commits Today"
          value={commitsToday}
          icon={TrendingUp}
          loading={loading}
          description="Last 24 hours"
        />
        <MetricCard
          title="This Week"
          value={commitsThisWeek}
          icon={Calendar}
          loading={loading}
          description="Last 7 days"
        />
      </div>
      <AgentsActivityTable commits={commits} users={users} loading={loading} />
    </div>
  )
}
