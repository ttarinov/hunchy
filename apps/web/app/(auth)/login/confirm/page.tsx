"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerTerminal01Icon } from "@hugeicons/core-free-icons"
import { useToast } from "@/components/ui/use-toast"
import { isSignInWithEmailLink, signInWithEmailLink, auth } from "@workspace/firebase-config/firebase"
export default function ConfirmPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSigningIn, setIsSigningIn] = useState(false)
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
      return
    }
    if (typeof window === "undefined") return
    const storedEmail = window.localStorage.getItem("emailForSignIn")
    if (storedEmail) {
      setEmail(storedEmail)
    }
    const urlParams = new URLSearchParams(window.location.search)
    const oobCode = urlParams.get("oobCode")
    const mode = urlParams.get("mode")
    if (mode === "signIn" && oobCode && isSignInWithEmailLink(auth, window.location.href)) {
      const emailToUse = storedEmail || ""
      if (!emailToUse) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Email not found. Please enter your email address.",
        })
        return
      }
      setIsSigningIn(true)
      signInWithEmailLink(auth, emailToUse, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn")
          toast({
            title: "Success",
            description: "Signed in successfully",
          })
          router.push("/dashboard")
        })
        .catch((error: unknown) => {
          console.error("Sign in error:", error)
          let errorMessage = "Failed to sign in"
          const authError = error as { code?: string; message?: string }
          if (authError?.code === "auth/invalid-action-code") {
            errorMessage = "This sign-in link has expired or has already been used. Please request a new one."
            window.localStorage.removeItem("emailForSignIn")
            setEmail("")
          } else if (authError?.code === "auth/expired-action-code") {
            errorMessage = "This sign-in link has expired. Please request a new one."
            window.localStorage.removeItem("emailForSignIn")
            setEmail("")
          } else {
            errorMessage = authError?.message || "Failed to sign in"
          }
          toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage,
          })
          setIsSigningIn(false)
        })
    }
  }, [user, loading, router, toast])
  const handleSignIn = async (emailToUse: string) => {
    if (!emailToUse) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Email is required",
      })
      return
    }
    if (!isSignInWithEmailLink(auth, window.location.href)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid sign-in link. Please request a new one.",
      })
      return
    }
    setIsSigningIn(true)
    try {
      await signInWithEmailLink(auth, emailToUse, window.location.href)
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("emailForSignIn")
      }
      toast({
        title: "Success",
        description: "Signed in successfully",
      })
      router.push("/dashboard")
    } catch (error: unknown) {
      console.error("Sign in error:", error)
      const authError = error as { code?: string; message?: string }
      const errorMessage = authError?.code === "auth/invalid-action-code" 
        ? "This sign-in link has expired or has already been used. Please request a new one."
        : authError?.message || "Failed to sign in"
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      })
    } finally {
      setIsSigningIn(false)
    }
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSignIn(email)
  }
  if (loading || user) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }
  return (
    <Card className="w-full max-w-md p-8 border-border bg-background/80 backdrop-blur-lg">
      <div className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={ComputerTerminal01Icon} size={32} className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold tracking-tight">Hunchy</span>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-semibold">Confirm Sign In</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email to complete sign in
            </p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSigningIn}
              required
            />
          </div>
          <Button
            type="submit"
            disabled={!email || isSigningIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            size="lg"
          >
            {isSigningIn ? "Signing in..." : "Complete Sign In"}
          </Button>
        </form>
      </div>
    </Card>
  )
}
