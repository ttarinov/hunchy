"use client"
import { useUsers } from "@/context/users-context"
import { useUsage } from "@/context/usage-context"
import { PaymentsTable } from "./_components/payments-table"
import { MetricCard } from "../dashboard/_components/metric-card"
import { CreditCard, Users, DollarSign, TrendingUp } from "lucide-react"
export default function PaymentsPage() {
  const { users, paidUsers, loading: usersLoading } = useUsers()
  const { totalUsageThisMonth, loading: usageLoading } = useUsage()
  const loading = usersLoading || usageLoading
  const paidUsersList = users.filter(
    (u) => u.plan && u.plan !== "free" && u.planExpiresAt && u.planExpiresAt > Date.now()
  )
  const totalRevenue = paidUsersList.reduce((acc, user) => {
    const planPrices: Record<string, number> = {
      starter: 9,
      pro: 29,
      enterprise: 99,
    }
    return acc + (planPrices[user.plan || ""] || 0)
  }, 0)
  const expiringSoon = paidUsersList.filter((u) => {
    const sevenDaysFromNow = Date.now() + 7 * 24 * 60 * 60 * 1000
    return u.planExpiresAt && u.planExpiresAt < sevenDaysFromNow
  }).length
  return (
    <div className="flex-1 space-y-8 p-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Payments & Usage
        </h1>
        <p className="text-muted-foreground">
          Monitor subscriptions and platform usage
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Paid Users"
          value={paidUsers}
          icon={Users}
          loading={loading}
          description="Active subscriptions"
        />
        <MetricCard
          title="Monthly Revenue"
          value={totalRevenue}
          icon={DollarSign}
          loading={loading}
          description="Estimated MRR ($)"
        />
        <MetricCard
          title="Expiring Soon"
          value={expiringSoon}
          icon={CreditCard}
          loading={loading}
          description="Within 7 days"
        />
        <MetricCard
          title="API Requests"
          value={totalUsageThisMonth}
          icon={TrendingUp}
          loading={loading}
          description="This month"
        />
      </div>
      <PaymentsTable users={paidUsersList} loading={loading} />
    </div>
  )
}
