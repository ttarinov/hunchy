"use client"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  CheckmarkCircle01Icon,
  Loading01Icon,
  AlertCircleIcon,
} from "@hugeicons/core-free-icons"
import { useHttpsCallable } from "react-firebase-hooks/functions"
import { functions } from "@workspace/firebase-config/firebase"
import { planLimits } from "../_components/mock-data"
import type { Plan } from "../_components/types"
interface UsageData {
  plan: string
  isSubscriptionActive?: boolean
  planExpiresAt?: number
  daysRemaining?: number
  limits: {
    commitsPerMonth: number | null
  }
}
interface VerifyPaymentResult {
  found: boolean
  processed: boolean
  paymentKey?: string
  planId?: string
}
function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const memo = searchParams.get("memo")
  const [getUsageData] = useHttpsCallable<void, UsageData>(functions, "getUsageData")
  const [verifyPaymentByMemo] = useHttpsCallable<{ memo: string; itemId?: string }, VerifyPaymentResult>(
    functions,
    "verifyPaymentByMemo"
  )
  const [status, setStatus] = useState<"loading" | "success" | "timeout" | "error">("loading")
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [verificationAttempted, setVerificationAttempted] = useState(false)
  const maxPolls = 10
  useEffect(() => {
    const pollForUpdate = async () => {
      try {
        const result = await getUsageData()
        if (result?.data) {
          const data = result.data
          setUsageData(data)
          if (data.plan !== "free" && data.isSubscriptionActive) {
            setStatus("success")
            return
          }
        }
        setPollCount((prev) => {
          if (prev >= maxPolls) {
            setStatus("timeout")
            return prev
          }
          setTimeout(pollForUpdate, 3000)
          return prev + 1
        })
      } catch (err) {
        console.error("Error polling for plan update:", err)
        setPollCount((prev) => {
          if (prev >= maxPolls) {
            setStatus("error")
            return prev
          }
          setTimeout(pollForUpdate, 3000)
          return prev + 1
        })
      }
    }
    if (memo && !verificationAttempted) {
      setVerificationAttempted(true)
      verifyPaymentByMemo({ memo })
        .then((verifyResult) => {
          if (verifyResult?.data) {
            console.log("Payment verification result", verifyResult.data)
            if (verifyResult.data.processed) {
              console.log("Payment processed successfully, starting to poll for plan update")
            } else if (verifyResult.data.found) {
              console.log("Payment found but not yet processed")
            } else {
              console.log("No payment found for memo, will continue polling")
            }
          }
          pollForUpdate()
        })
        .catch((err) => {
          console.error("Error verifying payment:", err)
          pollForUpdate()
        })
    } else {
      pollForUpdate()
    }
  }, [memo, verificationAttempted, getUsageData, verifyPaymentByMemo, maxPolls])
  const plan = (usageData?.plan || "free") as Plan
  const planInfo = planLimits[plan]
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="p-8 max-w-md w-full">
        {status === "loading" && (
          <div className="text-center space-y-4">
            <HugeiconsIcon icon={Loading01Icon} size={48} className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Processing Payment</h1>
            <p className="text-muted-foreground">
              Please wait while we confirm your payment and upgrade your plan...
            </p>
          </div>
        )}
        {status === "success" && usageData && (
          <div className="text-center space-y-4">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={48} className="h-12 w-12 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold">Payment Successful!</h1>
            <p className="text-muted-foreground">
              Your plan has been upgraded successfully.
            </p>
            <div className="pt-4 space-y-2 text-left bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">New Plan:</span>
                <span className="font-semibold">{planInfo.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Commits per month:</span>
                <span className="font-semibold">
                  {usageData.limits.commitsPerMonth || "Unlimited"}
                </span>
              </div>
              {usageData.daysRemaining !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Days remaining:</span>
                  <span className="font-semibold">{usageData.daysRemaining} days</span>
                </div>
              )}
            </div>
            <Button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-4"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
        {status === "timeout" && (
          <div className="text-center space-y-4">
            <HugeiconsIcon icon={AlertCircleIcon} size={48} className="h-12 w-12 text-amber-500 mx-auto" />
            <h1 className="text-2xl font-bold">Payment Processing</h1>
            <p className="text-muted-foreground">
              Your payment is being processed. This may take a few minutes.
              <br />
              <br />
              If your plan hasn't updated within 5 minutes, please contact support.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full mt-4"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
        {status === "error" && (
          <div className="text-center space-y-4">
            <HugeiconsIcon icon={AlertCircleIcon} size={48} className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold">Error</h1>
            <p className="text-muted-foreground">
              There was an error checking your payment status. Please check your dashboard or contact support.
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="w-full mt-4"
            >
              Go to Dashboard
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full">
          <div className="text-center space-y-4">
            <HugeiconsIcon icon={Loading01Icon} size={48} className="h-12 w-12 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold">Loading...</h1>
          </div>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
