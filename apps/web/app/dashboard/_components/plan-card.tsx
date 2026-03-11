"use client"
import { useEffect, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon, Settings01Icon } from "@hugeicons/core-free-icons"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { functions } from "@workspace/firebase-config/firebase"
import { planLimits } from "./mock-data"
import { PlanSelectionDialog } from "./plan-selection-dialog"
import { SubscriptionManagementDialog } from "./subscription-management-dialog"
import type { Plan } from "./types"
interface UsageData {
  tokensUsed: number
  tokensLimit: number
  requestsCount: number
  day: string
  plan: string
  isSubscriptionActive?: boolean
  planExpiresAt?: number
  daysRemaining?: number
  resetsAt: number
}
export function PlanCard() {
  const [getUsageData, loading, error] = useHttpsCallable<void, UsageData>(functions, "getUsageData")
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [manageDialogOpen, setManageDialogOpen] = useState(false)
  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const result = await getUsageData()
        if (result?.data) {
          setUsageData(result.data)
        }
      } catch (err) {
        console.error("Failed to fetch usage data:", err)
      }
    }
    fetchUsage()
  }, [getUsageData])
  const plan = (usageData?.plan || "free") as Plan
  const planInfo = planLimits[plan]
  const tokensUsed = usageData?.tokensUsed || 0
  const tokensLimit = usageData?.tokensLimit || 0
  const tokensPercentage = tokensLimit ? (tokensUsed / tokensLimit) * 100 : 0
  const isOverLimit = tokensLimit > 0 && tokensUsed > tokensLimit
  const overLimitAmount = isOverLimit ? tokensUsed - tokensLimit : 0
  const isPaidPlan = plan === "starter" || plan === "pro"
  const isSubscriptionActive = usageData?.isSubscriptionActive ?? false
  const daysRemaining = usageData?.daysRemaining
  const planExpiresAt = usageData?.planExpiresAt
  const isUnlimited = tokensLimit === Infinity || tokensLimit === 0
  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`
    return tokens.toString()
  }
  const getResetTime = () => {
    if (!usageData?.resetsAt) return "tomorrow at midnight UTC"
    const now = Date.now()
    const hoursUntil = Math.floor((usageData.resetsAt - now) / (1000 * 60 * 60))
    const minutesUntil = Math.floor(((usageData.resetsAt - now) % (1000 * 60 * 60)) / (1000 * 60))
    if (hoursUntil > 0) return `in ${hoursUntil}h ${minutesUntil}m`
    return `in ${minutesUntil}m`
  }
  const formatExpirationDate = (timestamp?: number) => {
    if (!timestamp) return null
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  return (
    <Card className="p-6 border-border bg-background/80">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">{planInfo.name}</span>
            <Badge variant="secondary">Current</Badge>
          </div>
          {isPaidPlan && planExpiresAt && (
            <div className="text-xs text-muted-foreground">
              {isSubscriptionActive ? (
                <>
                  Expires {formatExpirationDate(planExpiresAt)}
                  {daysRemaining !== undefined && (
                    <span className={daysRemaining < 7 ? "text-amber-500 font-medium ml-1" : ""}>
                      ({daysRemaining} {daysRemaining === 1 ? "day" : "days"} remaining)
                    </span>
                  )}
                </>
              ) : (
                <span className="text-destructive">Expired</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {plan === "free" && (
            <Button 
              size="sm" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setDialogOpen(true)}
            >
              Upgrade
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} className="h-4 w-4 ml-1" />
            </Button>
          )}
          {isPaidPlan && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setManageDialogOpen(true)}
            >
              <HugeiconsIcon icon={Settings01Icon} size={16} className="h-4 w-4 mr-1" />
              Manage
            </Button>
          )}
        </div>
      </div>
      {loading ? (
        <div className="text-sm text-muted-foreground">Loading usage data...</div>
      ) : error ? (
        <div className="text-sm text-destructive">Failed to load usage data</div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Tokens used today</span>
              <span className="font-medium">
                {formatTokens(tokensUsed)}
                {!isUnlimited && ` / ${formatTokens(tokensLimit)}`}
                {isOverLimit && (
                  <span className="text-green-400 ml-1">({formatTokens(overLimitAmount)} over - on us!)</span>
                )}
              </span>
            </div>
            {!isUnlimited && (
              <div className="w-full bg-secondary/10 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    isOverLimit ? "bg-blue-500" : "bg-secondary"
                  }`}
                  style={{ width: `${Math.min(Math.max(tokensPercentage, 0), 100)}%` }}
                />
                {isOverLimit && (
                  <div className="w-full bg-amber-500/20 rounded-full h-2 -mt-2" />
                )}
              </div>
            )}
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-muted-foreground">Resets {getResetTime()}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-border/50 space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Plan limits:</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Tokens:</span>
              <span className="font-medium">
                {isUnlimited ? "Unlimited" : `${formatTokens(tokensLimit)} per day`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Requests today:</span>
              <span className="font-medium">
                {usageData?.requestsCount || 0}
              </span>
            </div>
          </div>
        </div>
      )}
      <PlanSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        currentPlan={plan}
      />
      {isPaidPlan && (
        <SubscriptionManagementDialog
          open={manageDialogOpen}
          onOpenChange={setManageDialogOpen}
          currentPlan={plan}
          planExpiresAt={planExpiresAt}
          daysRemaining={daysRemaining}
          isSubscriptionActive={isSubscriptionActive}
        />
      )}
    </Card>
  )
}
