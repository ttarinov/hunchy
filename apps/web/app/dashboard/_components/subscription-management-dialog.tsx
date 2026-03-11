"use client"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Shield01Icon,
  Calendar01Icon,
  ArrowUpRight01Icon,
  Refresh01Icon,
} from "@hugeicons/core-free-icons"
import { PlanSelectionDialog } from "./plan-selection-dialog"
import { planLimits } from "./mock-data"
import type { Plan } from "./types"
interface SubscriptionManagementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan: Plan
  planExpiresAt?: number
  daysRemaining?: number
  isSubscriptionActive?: boolean
}
const formatExpirationDate = (timestamp?: number) => {
  if (!timestamp) return "N/A"
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
export function SubscriptionManagementDialog({
  open,
  onOpenChange,
  currentPlan,
  planExpiresAt,
  daysRemaining,
  isSubscriptionActive,
}: SubscriptionManagementDialogProps) {
  const [planDialogOpen, setPlanDialogOpen] = useState(false)
  const [planDialogMode, setPlanDialogMode] = useState<"extend" | "change">("extend")
  const planInfo = planLimits[currentPlan]
  const isPaidPlan = currentPlan === "starter" || currentPlan === "pro"
  const handleExtend = () => {
    setPlanDialogMode("extend")
    setPlanDialogOpen(true)
  }
  const handleChangePlan = () => {
    setPlanDialogMode("change")
    setPlanDialogOpen(true)
  }
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Manage Subscription</DialogTitle>
            <DialogDescription>
              View and manage your subscription details
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="extend">Extend</TabsTrigger>
              <TabsTrigger value="change">Change Plan</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Plan</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{planInfo.name}</span>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </div>
                  {isPaidPlan && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground flex items-center gap-2">
                          <HugeiconsIcon icon={Calendar01Icon} size={16} className="h-4 w-4" />
                          Expiration Date
                        </span>
                        <span className="text-sm font-medium">
                          {formatExpirationDate(planExpiresAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Status</span>
                        <Badge variant={isSubscriptionActive ? "default" : "destructive"}>
                          {isSubscriptionActive ? "Active" : "Expired"}
                        </Badge>
                      </div>
                      {daysRemaining !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Time Remaining</span>
                          <span className={`text-sm font-medium ${daysRemaining < 7 ? "text-amber-500" : ""}`}>
                            {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                  <div className="pt-4 border-t space-y-2">
                    <div className="text-sm font-medium mb-2">Plan Features</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commits per month</span>
                      <span className="font-medium">
                        {planInfo.commits === "Unlimited" ? "Unlimited" : `${planInfo.commits}`}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
              {isPaidPlan && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <HugeiconsIcon icon={Shield01Icon} size={16} className="h-4 w-4" />
                  <span>30-day money-back guarantee</span>
                </div>
              )}
            </TabsContent>
            <TabsContent value="extend" className="space-y-4 mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Extend Your Subscription</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Renew your current {planInfo.name} plan for an additional period. Your subscription will be extended from the current expiration date.
                    </p>
                    {planExpiresAt && (
                      <div className="text-sm mb-4 p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Current expiration:</span>
                          <span className="font-medium">{formatExpirationDate(planExpiresAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
              <Button
                onClick={handleExtend}
                className="w-full bg-secondary hover:bg-secondary/90 text-background"
              >
                <HugeiconsIcon icon={Refresh01Icon} size={16} className="h-4 w-4 mr-2" />
                Extend Subscription
              </Button>
            </TabsContent>
            <TabsContent value="change" className="space-y-4 mt-4">
              <Card className="p-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Change Your Plan</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upgrade or downgrade to a different plan. You can switch between Starter and Pro plans.
                    </p>
                    <div className="text-sm mb-4 p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-muted-foreground">Current plan:</span>
                        <span className="font-medium">{planInfo.name}</span>
                      </div>
                      {currentPlan === "starter" && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Upgrade to Pro for 800 commits/month and advanced features
                        </div>
                      )}
                      {currentPlan === "pro" && (
                        <div className="text-xs text-muted-foreground mt-2">
                          Downgrade to Starter for 300 commits/month
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              <Button
                onClick={handleChangePlan}
                variant="outline"
                className="w-full"
              >
                <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} className="h-4 w-4 mr-2" />
                Change Plan
              </Button>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PlanSelectionDialog
        open={planDialogOpen}
        onOpenChange={(open) => {
          setPlanDialogOpen(open)
          if (!open) {
            onOpenChange(false)
          }
        }}
        currentPlan={currentPlan}
        mode={planDialogMode}
      />
    </>
  )
}
