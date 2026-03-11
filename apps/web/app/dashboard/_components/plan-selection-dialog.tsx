"use client"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Shield01Icon,
  SparklesIcon,
  CrownIcon,
  Tick01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { functions } from "@workspace/firebase-config/firebase"
type PlanId = "starter" | "pro"
type PeriodMonths = 3 | 6 | 12
const PLAN_PRICES = {
  starter: 5,
  pro: 10,
}
const PLAN_INFO: Record<"starter" | "pro", { name: string; icon: IconSvgElement; commits: number; features: string[] }> = {
  starter: {
    name: "Starter",
    icon: SparklesIcon,
    commits: 300,
    features: ["300 commits/month", "Email support", "Basic analytics"],
  },
  pro: {
    name: "Pro",
    icon: CrownIcon,
    commits: 800,
    features: ["800 commits/month", "Priority support", "Advanced analytics", "API access"],
  },
}
const PERIODS = [
  { value: 3, label: "3 months", discount: 0 },
  { value: 6, label: "6 months", discount: 0.10 },
  { value: 12, label: "1 year", discount: 0.17, popular: true },
] as const
function calculatePrice(basePrice: number, periodMonths: PeriodMonths): { 
  total: number
  savings: number
  originalTotal: number
  monthlyPrice: number 
} {
  const originalTotal = basePrice * periodMonths
  const period = PERIODS.find(p => p.value === periodMonths)
  const discount = period?.discount || 0
  const total = originalTotal * (1 - discount)
  const savings = originalTotal - total
  const monthlyPrice = total / periodMonths
  return { total, savings, originalTotal, monthlyPrice }
}
interface PlanSelectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPlan?: string
  mode?: "extend" | "change"
}
export function PlanSelectionDialog({ 
  open, 
  onOpenChange, 
  currentPlan, 
  mode = "change" 
}: PlanSelectionDialogProps) {
  const getInitialPlan = (): PlanId => {
    if (mode === "extend" && currentPlan && (currentPlan === "starter" || currentPlan === "pro")) {
      return currentPlan as PlanId
    }
    if (currentPlan === "starter") return "pro"
    return "starter"
  }
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(getInitialPlan())
  const [periodMonths, setPeriodMonths] = useState<PeriodMonths>(3)
  const [initiatePayment, initiatingPayment] = useHttpsCallable<{ planId: PlanId; periodMonths: PeriodMonths }, { paymentUrl: string }>(functions, "initiatePayment")
  useEffect(() => {
    if (open) {
      setSelectedPlan(getInitialPlan())
      setPeriodMonths(3)
    }
  }, [open, mode, currentPlan])
  const price = calculatePrice(PLAN_PRICES[selectedPlan], periodMonths)
  const handleProceed = async () => {
    try {
      const result = await initiatePayment({ planId: selectedPlan, periodMonths })
      if (result?.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl
      }
    } catch (err) {
      console.error("Failed to initiate payment:", err)
    }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] bg-zinc-900 border-zinc-800 p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-zinc-800/50">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-zinc-100">
              {mode === "extend" ? "Extend Subscription" : "Choose Your Plan"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              {mode === "extend"
                ? `Extend your ${currentPlan} plan by selecting a billing period`
                : "Select a plan that works best for you"}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="px-6 py-5 space-y-5">
          {mode === "change" && (
            <div className="grid grid-cols-2 gap-3">
              {(["starter", "pro"] as const).map((plan) => {
                const info = PLAN_INFO[plan]
                const icon = info.icon
                const isSelected = selectedPlan === plan
                const isCurrent = currentPlan === plan
                return (
                  <Card
                    key={plan}
                    onClick={() => setSelectedPlan(plan)}
                    className={`
                      relative p-4 cursor-pointer transition-all duration-200 border-2
                      ${isSelected 
                        ? "bg-secondary/10 border-secondary/50" 
                        : "bg-zinc-800/30 border-zinc-700/50 hover:border-zinc-600"
                      }
                    `}
                  >
                    {plan === "pro" && (
                      <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-secondary text-zinc-900 rounded-full">
                          POPULAR
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`
                        p-1.5 rounded-lg
                        ${isSelected ? "bg-secondary/20" : "bg-zinc-700/50"}
                      `}>
                        <HugeiconsIcon icon={icon} size={16} className={`h-4 w-4 ${isSelected ? "text-secondary" : "text-zinc-400"}`} />
                      </div>
                      <span className="font-semibold text-zinc-100">{info.name}</span>
                      {isCurrent && (
                        <span className="ml-auto text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold text-zinc-100">${PLAN_PRICES[plan]}</span>
                      <span className="text-sm text-zinc-500">/mo</span>
                    </div>
                    <ul className="space-y-1.5">
                      {info.features.slice(0, 2).map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-xs text-zinc-400">
                          <HugeiconsIcon icon={Tick01Icon} size={12} className={`h-3 w-3 ${isSelected ? "text-secondary" : "text-zinc-500"}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <div className="absolute top-3 right-3">
                        <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center">
                          <HugeiconsIcon icon={Tick01Icon} size={12} className="h-3 w-3 text-zinc-900" />
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
          {mode === "extend" && currentPlan && (
            <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-secondary/20">
                  {currentPlan === "pro" ? (
                    <HugeiconsIcon icon={CrownIcon} size={20} className="h-5 w-5 text-secondary" />
                  ) : (
                    <HugeiconsIcon icon={SparklesIcon} size={20} className="h-5 w-5 text-secondary" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-100">{PLAN_INFO[selectedPlan]?.name}</span>
                    <span className="text-[10px] text-zinc-500 bg-zinc-700 px-1.5 py-0.5 rounded">
                      Current Plan
                    </span>
                  </div>
                  <span className="text-sm text-zinc-400">
                    {PLAN_INFO[selectedPlan]?.commits} commits/month
                  </span>
                </div>
              </div>
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-3 block">
              Billing Period
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PERIODS.map((period) => {
                const isSelected = periodMonths === period.value
                return (
                  <button
                    key={period.value}
                    type="button"
                    onClick={() => setPeriodMonths(period.value as PeriodMonths)}
                    className={`
                      relative py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${isSelected 
                        ? "bg-secondary text-zinc-900" 
                        : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50 border border-zinc-700/50"
                      }
                    `}
                  >
                    {period.label}
                    {period.discount > 0 && (
                      <span className={`
                        absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                        ${isSelected ? "bg-zinc-900 text-secondary" : "bg-emerald-500/20 text-emerald-400"}
                      `}>
                        -{Math.round(period.discount * 100)}%
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="p-4 bg-zinc-800/30 rounded-xl border border-zinc-700/50 space-y-3">
            <div className="absolute -mt-7 ml-2">
              <span className="px-2.5 py-1 text-[10px] font-semibold bg-linear-to-r from-secondary to-primary text-zinc-900 rounded-full">
                Early Adopter Pricing
              </span>
            </div>
            <div className="flex items-end justify-between pt-2">
              <div>
                <span className="text-xs text-zinc-500 block mb-1">Monthly cost</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold text-zinc-100">
                    ${price.monthlyPrice.toFixed(price.monthlyPrice % 1 === 0 ? 0 : 2)}
                  </span>
                  <span className="text-zinc-500">/mo</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-zinc-500 block mb-1">Total</span>
                <span className="text-lg font-semibold text-zinc-200">${price.total.toFixed(0)}</span>
              </div>
            </div>
            {price.savings > 0 && (
              <div className="flex items-center justify-between pt-2 border-t border-zinc-700/50">
                <span className="text-sm text-zinc-400">You save</span>
                <span className="text-sm font-semibold text-emerald-400">
                  ${price.savings.toFixed(2)}
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2.5 bg-zinc-800/20 rounded-lg">
            <HugeiconsIcon icon={Shield01Icon} size={20} className="h-5 w-5 text-secondary" />
            <span className="text-sm text-zinc-300">30-day money-back guarantee</span>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-zinc-800/50 flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1 bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleProceed}
            disabled={initiatingPayment}
            className="flex-1 bg-secondary hover:bg-secondary/90 text-zinc-900 font-semibold"
          >
            {initiatingPayment ? (
              <>
                <div className="w-4 h-4 border-2 border-zinc-900/30 border-t-zinc-900 rounded-full animate-spin mr-2" />
                Processing...
              </>
            ) : (
              <>
                Continue
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
