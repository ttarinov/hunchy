"use client"
import { useMemo } from "react"
import { useUsage } from "@/context/usage-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, subDays, startOfDay } from "date-fns"
export function TokensChart() {
  const { usage, loading } = useUsage()
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i))
      return {
        date,
        dateStr: format(date, "MMM d"),
        count: 0,
      }
    })
    usage.forEach((entry) => {
      if (entry.lastUpdated && entry.tokensUsed) {
        const entryDate = startOfDay(new Date(entry.lastUpdated))
        const dayData = last30Days.find(
          (d) => d.date.getTime() === entryDate.getTime()
        )
        if (dayData) {
          dayData.count += entry.tokensUsed
        }
      }
    })
    return last30Days
  }, [usage])
  const maxCount = Math.max(...chartData.map((d) => d.count), 1)
  const formatTokens = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`
    if (count >= 1000) return `${(count / 1000).toFixed(0)}k`
    return count.toString()
  }
  if (loading) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground">Tokens Usage</CardTitle>
          <CardDescription className="text-muted-foreground">Token consumption over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] w-full animate-pulse rounded-md bg-muted" />
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground">Tokens Usage</CardTitle>
        <CardDescription className="text-muted-foreground">Token consumption over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] items-end gap-1">
          {chartData.map((day, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${day.dateStr}: ${formatTokens(day.count)} tokens`}
            >
              <div
                className="w-full bg-chart-3/80 rounded-t transition-all hover:bg-chart-3"
                style={{
                  height: `${Math.max((day.count / maxCount) * 100, 2)}%`,
                  minHeight: day.count > 0 ? "8px" : "2px",
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>{chartData[0]?.dateStr}</span>
          <span>{chartData[chartData.length - 1]?.dateStr}</span>
        </div>
      </CardContent>
    </Card>
  )
}
