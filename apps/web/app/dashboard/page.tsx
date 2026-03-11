"use client"
import { PlanCard } from "./_components/plan-card"
import { TokensChart } from "./_components/tokens-chart"
import { PRList } from "./_components/pr-list"
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Track your commits, PRs, and development metrics
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <PlanCard />
        <TokensChart />
      </div>
      <PRList />
    </div>
  )
}
