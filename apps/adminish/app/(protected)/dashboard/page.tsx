"use client"
import { useUsers } from "@/context/users-context"
import { useUsage } from "@/context/usage-context"
import { MetricCard } from "./_components/metric-card"
import { UsersChart } from "./_components/users-chart"
import { CommitsChart } from "./_components/commits-chart"
import { TokensChart } from "./_components/tokens-chart"
import {
  Users,
  UserCheck,
  CreditCard,
  Activity,
  GitCommit,
  Coins,
} from "lucide-react"
export default function DashboardPage() {
  const {
    totalUsers,
    monthlyActiveUsers,
    dailyActiveUsers,
    paidUsers,
    loading: usersLoading,
  } = useUsers()
  const {
    totalCommits,
    totalTokens,
    totalCommitsThisMonth,
    totalTokensThisMonth,
    loading: usageLoading,
  } = useUsage()
  const loading = usersLoading || usageLoading
  const formatTokens = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k`
    return count.toString()
  }
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Overview of your platform metrics
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Users"
          value={totalUsers}
          icon={Users}
          loading={loading}
          description="All registered users"
        />
        <MetricCard
          title="Monthly Active Users"
          value={monthlyActiveUsers}
          icon={UserCheck}
          loading={loading}
          description="Active in last 30 days"
        />
        <MetricCard
          title="Daily Active Users"
          value={dailyActiveUsers}
          icon={Activity}
          loading={loading}
          description="Active in last 24 hours"
        />
        <MetricCard
          title="Paid Users"
          value={paidUsers}
          icon={CreditCard}
          loading={loading}
          description="Users with active subscription"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Commits"
          value={totalCommits}
          icon={GitCommit}
          loading={loading}
          description="All time commits"
        />
        <MetricCard
          title="Commits This Month"
          value={totalCommitsThisMonth}
          icon={GitCommit}
          loading={loading}
          description="Commits this billing period"
        />
        <MetricCard
          title="Total Tokens"
          value={formatTokens(totalTokens)}
          icon={Coins}
          loading={loading}
          description="All time token usage"
        />
        <MetricCard
          title="Tokens This Month"
          value={formatTokens(totalTokensThisMonth)}
          icon={Coins}
          loading={loading}
          description="Tokens this billing period"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <UsersChart />
        <CommitsChart />
        <TokensChart />
      </div>
    </div>
  )
}
