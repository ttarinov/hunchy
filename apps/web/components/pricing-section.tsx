"use client"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  SparklesIcon,
  FlashIcon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { functions } from "@workspace/firebase-config/firebase"
type PeriodMonths = 3 | 6 | 12
const PLAN_PRICES = {
  starter: 5,
  pro: 10,
}
function calculatePrice(basePrice: number, periodMonths: PeriodMonths): { total: number; savings: number; originalTotal: number; monthlyPrice: number } {
  const originalTotal = basePrice * periodMonths
  let discount = 0
  if (periodMonths === 6) {
    discount = 0.10
  } else if (periodMonths === 12) {
    discount = 0.17
  }
  const total = originalTotal * (1 - discount)
  const savings = originalTotal - total
  const monthlyPrice = total / periodMonths
  return { total, savings, originalTotal, monthlyPrice }
}
export function PricingSection() {
  const [periodMonths, setPeriodMonths] = useState<PeriodMonths>(3)
  const [initiatePayment, initiatingPayment] = useHttpsCallable<{ planId: "starter" | "pro"; periodMonths: PeriodMonths }, { paymentUrl: string }>(functions, "initiatePayment")
  const handleUpgrade = async (planId: "starter" | "pro") => {
    try {
      const result = await initiatePayment({ planId, periodMonths })
      if (result?.data?.paymentUrl) {
        window.location.href = result.data.paymentUrl
      }
    } catch (err) {
      console.error("Failed to initiate payment:", err)
    }
  }
  const starterPrice = calculatePrice(PLAN_PRICES.starter, periodMonths)
  const proPrice = calculatePrice(PLAN_PRICES.pro, periodMonths)
  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-balance">
              Simple, <span className="text-primary">transparent</span> pricing
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty mb-8">
              Start free, upgrade when you need more. No hidden fees, cancel anytime.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-2 max-w-6xl mx-auto relative">
            <div className="absolute -top-12 left-0 flex items-center gap-2 text-base font-medium text-foreground px-4 py-2">
              <span>Limited Early Adopter Price</span>
            </div>
            <div className="absolute -top-12 right-0">
              <div className="flex items-center gap-2">
                <ToggleGroup
                  type="single"
                  value={periodMonths.toString()}
                  onValueChange={(value) => value && setPeriodMonths(Number(value) as PeriodMonths)}
                  className="inline-flex h-10 items-center justify-center gap-1"
                >
                  <ToggleGroupItem value="3" className="rounded-full border-0 bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    3 months
                  </ToggleGroupItem>
                  <ToggleGroupItem value="6" className="rounded-full border-0 bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    6 months
                  </ToggleGroupItem>
                  <ToggleGroupItem value="12" className="rounded-full border-0 bg-transparent data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                    1 year
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            {}
            <Card className="border-border bg-card/50 backdrop-blur-sm p-8 relative mt-16">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <HugeiconsIcon icon={FlashIcon} size={20} className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">Free</h3>
                </div>
                <p className="text-muted-foreground">Perfect for trying Hunchy</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>50K tokens</strong> per day
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Semantic commit messages</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Basic code explanations</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">CLI access</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Claude & Cursor integration</span>
                </li>
              </ul>
              <Button variant="outline" size="lg" className="w-full bg-transparent" asChild>
                <a href="#early-access">Join Waitlist</a>
              </Button>
            </Card>
            {}
            <Card className="border-secondary bg-card/50 backdrop-blur-sm p-8 relative shadow-lg shadow-secondary/10 mt-16">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary rounded-full">
                <span className="text-xs font-semibold text-background">POPULAR</span>
              </div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <HugeiconsIcon icon={SparklesIcon} size={20} className="h-5 w-5 text-secondary" />
                  <h3 className="text-2xl font-bold">Starter</h3>
                </div>
                <p className="text-muted-foreground">For active developers</p>
              </div>
              <div className="mb-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">${periodMonths === 3 ? starterPrice.monthlyPrice.toFixed(0) : starterPrice.monthlyPrice.toFixed(2)}</span>
                    <span className="text-muted-foreground text-lg">/month</span>
                  </div>
                  {starterPrice.savings > 0 && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-muted-foreground line-through">
                        ${PLAN_PRICES.starter}/month
                      </span>
                      <span className="text-green-500 font-medium">
                        Save ${starterPrice.savings.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>500K tokens</strong> per day
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced code analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm">Web dashboard access</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm">Time tracking & complexity</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-secondary shrink-0 mt-0.5" />
                  <span className="text-sm">PR summaries</span>
                </li>
              </ul>
              <Button 
                size="lg" 
                className="w-full bg-secondary hover:bg-secondary/90 text-background"
                onClick={() => handleUpgrade("starter")}
                disabled={initiatingPayment}
              >
                {initiatingPayment ? "Loading..." : "Upgrade Now"}
              </Button>
            </Card>
            {}
            <Card className="border-border bg-card/50 backdrop-blur-sm p-8 relative mt-16">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <HugeiconsIcon icon={SparklesIcon} size={20} className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">Pro</h3>
                </div>
                <p className="text-muted-foreground">For power users</p>
              </div>
              <div className="mb-6">
                <div className="flex flex-col gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">${periodMonths === 3 ? proPrice.monthlyPrice.toFixed(0) : proPrice.monthlyPrice.toFixed(2)}</span>
                    <span className="text-muted-foreground text-lg">/month</span>
                  </div>
                  {proPrice.savings > 0 && (
                    <div className="flex items-center gap-2 text-sm mt-1">
                      <span className="text-muted-foreground line-through">
                        ${PLAN_PRICES.pro}/month
                      </span>
                      <span className="text-green-500 font-medium">
                        Save ${proPrice.savings.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>2M tokens</strong> per day
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Starter</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced code analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Web dashboard access</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Time tracking & complexity</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">PR summaries</span>
                </li>
              </ul>
              <Button 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => handleUpgrade("pro")}
                disabled={initiatingPayment}
              >
                {initiatingPayment ? "Loading..." : "Upgrade Now"}
              </Button>
            </Card>
            {}
            <Card className="border-border bg-card/50 backdrop-blur-sm p-8 relative mt-16">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <HugeiconsIcon icon={SparklesIcon} size={20} className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">Enterprise</h3>
                </div>
                <p className="text-muted-foreground">For large organizations</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">
                    <strong>Unlimited tokens</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Everything in Pro</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Auto-branch organization</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Priority support</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Custom integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">Dedicated support</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">On-premise options</span>
                </li>
                <li className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={20} className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">SLA guarantees</span>
                </li>
              </ul>
              <Button variant="outline" size="lg" className="w-full bg-transparent" asChild>
                <a href="#early-access">Talk to sales</a>
              </Button>
            </Card>
          </div>
          <div className="flex items-center justify-center gap-2 text-base font-medium text-foreground mt-8">
            <HugeiconsIcon icon={Shield01Icon} size={20} className="h-5 w-5 text-primary" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </section>
  )
}
