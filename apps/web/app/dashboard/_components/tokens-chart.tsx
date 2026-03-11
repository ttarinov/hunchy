"use client"
import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { functions } from "@workspace/firebase-config/firebase"
import { chartConfig } from "./mock-data"
interface UsageHistoryItem {
  day: string
  tokensUsed: number
  requestsCount: number
}
function formatDayForDisplay(day: string): string {
  const [year, month, dayNum] = day.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum))
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}
function formatTokens(tokens: number): string {
  if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
  if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`
  return tokens.toString()
}
export function TokensChart() {
  const [getUsageHistory, loading, error] = useHttpsCallable<{ days?: number }, UsageHistoryItem[]>(
    functions,
    "getUsageHistory"
  )
  const [usageData, setUsageData] = useState<Array<{ date: string; tokens: number }>>([])
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await getUsageHistory({ days: 30 })
        if (result?.data && Array.isArray(result.data)) {
          const chartData = result.data.map((item) => ({
            date: formatDayForDisplay(item.day),
            tokens: item.tokensUsed
          }))
          setUsageData(chartData)
        } else {
          setUsageData([])
        }
      } catch (err) {
        console.error("Failed to fetch usage history:", err)
        setUsageData([])
      }
    }
    fetchHistory()
  }, [getUsageHistory])
  return (
    <Card className="p-6 border-border bg-background/80">
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Tokens Used (Last 30 Days)</h2>
        <p className="text-sm text-muted-foreground">
          Daily token usage over the past month
        </p>
      </div>
      {loading ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
          Loading chart data...
        </div>
      ) : error ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-destructive">
          Failed to load usage data
        </div>
      ) : usageData.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-muted-foreground">
          No usage data available yet. Start using the CLI to see your token usage!
        </div>
      ) : (
        <ChartContainer config={chartConfig} className="h-[200px]">
          <LineChart data={usageData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
              tickFormatter={(value) => formatTokens(value)}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              type="monotone"
              dataKey="tokens"
              stroke="var(--color-tokens)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      )}
    </Card>
  )
}
