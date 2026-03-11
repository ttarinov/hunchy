"use client"
import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "../../../context/auth-context"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  Tick01Icon,
  Cancel01Icon,
  Loading01Icon,
  User02Icon,
  Key01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"
import { useToast } from "@/components/ui/use-toast"
import { database, ref, get, update } from "@workspace/firebase-config/firebase"
type AuthState = "loading" | "validating" | "pending" | "approved" | "error"
function CliAuthContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [state, setState] = useState<AuthState>("loading")
  const [deviceCode, setDeviceCode] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [validationAttempts, setValidationAttempts] = useState(0)
  useEffect(() => {
    if (!loading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)
    }
  }, [user, loading, router])
  useEffect(() => {
    if (loading) return
    const code = searchParams.get("device_code")
    if (!code) {
      setErrorMessage("Missing device code")
      setState("error")
      return
    }
    setDeviceCode(code)
    setState("validating")
    const validateDeviceCode = async () => {
      try {
        const deviceRef = ref(database, `cliAuth/${code}`)
        const snapshot = await get(deviceRef)
        if (!snapshot.exists()) {
          if (validationAttempts < 10) {
            setValidationAttempts(prev => prev + 1)
            setTimeout(() => validateDeviceCode(), 500)
            return
          }
          setErrorMessage("Invalid device code. Please try running 'hunchy auth' again.")
          setState("error")
          return
        }
        const data = snapshot.val()
        if (data.expiresAt && Date.now() > data.expiresAt) {
          setErrorMessage("Device code has expired")
          setState("error")
          return
        }
        if (data.status === "completed") {
          setErrorMessage("This device has already been authenticated")
          setState("error")
          return
        }
        setState("pending")
      } catch (err) {
        console.error("Error validating device code:", err)
        if (validationAttempts < 10) {
          setValidationAttempts(prev => prev + 1)
          setTimeout(() => validateDeviceCode(), 500)
          return
        }
        setErrorMessage("Failed to validate device code.")
        setState("error")
      }
    }
    validateDeviceCode()
  }, [searchParams, loading, validationAttempts])
  const handleApprove = async () => {
    if (!deviceCode || !user) return
    setIsApproving(true)
    try {
      const deviceRef = ref(database, `cliAuth/${deviceCode}`)
      await update(deviceRef, {
        userId: user.uid,
        email: user.email,
        status: "approved"
      })
      setState("approved")
      toast({
        title: "Success",
        description: "CLI authentication approved! Return to your terminal.",
      })
    } catch (err) {
      console.error("Error approving auth:", err)
      toast({
        variant: "destructive",
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to approve authentication",
      })
    } finally {
      setIsApproving(false)
    }
  }
  const handleDeny = () => {
    setState("error")
    setErrorMessage("Access was denied")
  }
  return (
    <div className="w-full max-w-lg">
      <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/80 rounded-2xl overflow-hidden shadow-2xl">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800/50 bg-zinc-900/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
          </div>
          <div className="flex items-center gap-2 ml-2">
            <HugeiconsIcon icon={ComputerTerminal01Icon} size={16} className={`h-4 w-4 ${state === "error" ? "text-red-400" : "text-secondary"}`} />
            <span className="text-sm font-semibold text-zinc-200 tracking-wide">HUNCHY CLI</span>
          </div>
          <span className="ml-auto text-xs text-zinc-600 font-mono">v1.0.0</span>
        </div>
        <div className="p-6 space-y-5">
          {(state === "loading" || state === "validating") && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-secondary font-mono text-sm">$</span>
                <span className="text-zinc-300 font-mono text-sm">hunchy auth</span>
              </div>
              <div className="ml-5 space-y-2">
                <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono">
                  <HugeiconsIcon icon={Loading01Icon} size={14} className="h-3.5 w-3.5 animate-spin text-secondary" />
                  <span>Validating device code...</span>
                </div>
                <div className="text-zinc-600 text-xs font-mono">
                  &gt; Checking authentication request
                </div>
              </div>
            </div>
          )}
          {state === "error" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-red-400 font-mono text-sm">$</span>
                <span className="text-red-400 font-mono text-sm">Authentication denied</span>
              </div>
              <div className="ml-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <HugeiconsIcon icon={Cancel01Icon} size={20} className="h-5 w-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-zinc-300 mb-1">{errorMessage || "Access was denied"}</p>
                    <p className="text-xs text-zinc-500 font-mono">
                      Run &apos;hunchy auth&apos; again to retry
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                variant="outline"
                className="w-full bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              >
                <HugeiconsIcon icon={ComputerTerminal01Icon} size={16} className="mr-2 h-4 w-4" />
                Exit
              </Button>
            </div>
          )}
          {state === "approved" && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-emerald-400 font-mono text-sm">$</span>
                <span className="text-emerald-400 font-mono text-sm">Authentication successful</span>
                <HugeiconsIcon icon={Tick01Icon} size={16} className="h-4 w-4 text-emerald-400" />
              </div>
              <div className="ml-5 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <HugeiconsIcon icon={Tick01Icon} size={20} className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-300 mb-1">CLI access granted</p>
                    <p className="text-xs text-zinc-500">
                      You can now return to your terminal
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-5 space-y-1.5 font-mono text-xs">
                <div className="text-zinc-600">&gt; Authenticated as:</div>
                <div className="text-secondary pl-2">{user?.email}</div>
              </div>
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-secondary hover:bg-secondary/90 text-zinc-900 font-semibold"
              >
                <HugeiconsIcon icon={Tick01Icon} size={16} className="mr-2 h-4 w-4" />
                Done
              </Button>
            </div>
          )}
          {state === "pending" && (
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="text-secondary font-mono text-sm">$</span>
                <span className="text-zinc-300 font-mono text-sm">Authorize CLI access?</span>
              </div>
              <div className="ml-5 space-y-3">
                <div className="p-4 bg-zinc-800/50 border border-zinc-700/50 rounded-xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-secondary/20 rounded-lg">
                      <HugeiconsIcon icon={User02Icon} size={16} className="h-4 w-4 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-0.5">Account</div>
                      <div className="text-sm text-zinc-200 font-medium">{user?.email}</div>
                    </div>
                  </div>
                  <div className="h-px bg-zinc-700/50" />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-700/50 rounded-lg">
                      <HugeiconsIcon icon={Key01Icon} size={16} className="h-4 w-4 text-zinc-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-0.5">Device Code</div>
                      <div className="text-sm text-zinc-400 font-mono">{deviceCode?.slice(0, 16)}...</div>
                    </div>
                  </div>
                  <div className="h-px bg-zinc-700/50" />
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                      <HugeiconsIcon icon={Clock01Icon} size={16} className="h-4 w-4 text-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-xs text-zinc-500 mb-0.5">Status</div>
                      <div className="text-sm text-amber-400 font-medium">Pending Approval</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2.5">
                <Button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="w-full bg-secondary hover:bg-secondary/90 text-zinc-900 font-semibold h-11"
                >
                  {isApproving ? (
                    <>
                      <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={Tick01Icon} size={16} className="mr-2 h-4 w-4" />
                      <span className="font-mono mr-1 opacity-60">[Y]</span> Approve Access
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleDeny}
                  disabled={isApproving}
                  variant="outline"
                  className="w-full bg-transparent border-zinc-700 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 h-11"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} className="mr-2 h-4 w-4" />
                  <span className="font-mono mr-1 opacity-60">[N]</span> Deny Access
                </Button>
              </div>
              <p className="text-xs text-zinc-600 text-center pt-2 border-t border-zinc-800/50">
                By approving, you authorize this CLI instance to access your Hunchy account.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
export default function CliAuthPage() {
  return (
    <div className="h-screen bg-zinc-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-3">
          <HugeiconsIcon icon={Loading01Icon} size={32} className="h-8 w-8 animate-spin text-secondary" />
          <p className="text-zinc-500 text-sm">Loading...</p>
        </div>
      }>
        <CliAuthContent />
      </Suspense>
    </div>
  )
}
