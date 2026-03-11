"use client"
import { useMemo } from "react"
import { useUsers } from "@/context/users-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { format, subDays, startOfDay } from "date-fns"
export function UsersChart() {
  const { users, loading } = useUsers()
  const chartData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i))
      return {
        date,
        dateStr: format(date, "MMM d"),
        count: 0,
      }
    })
    users.forEach((user) => {
      if (user.createdAt) {
        const userDate = startOfDay(new Date(user.createdAt))
        const dayData = last30Days.find(
          (d) => d.date.getTime() === userDate.getTime()
        )
        if (dayData) {
          dayData.count++
        }
      }
    })
    return last30Days
  }, [users])
  const maxCount = Math.max(...chartData.map((d) => d.count), 1)
  if (loading) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-foreground">New Users</CardTitle>
          <CardDescription className="text-muted-foreground">User registrations over the last 30 days</CardDescription>
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
        <CardTitle className="text-xl font-semibold text-foreground">New Users</CardTitle>
        <CardDescription className="text-muted-foreground">User registrations over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] items-end gap-1">
          {chartData.map((day, i) => (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1"
              title={`${day.dateStr}: ${day.count} users`}
            >
              <div
                className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
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
