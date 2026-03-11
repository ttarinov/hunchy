"use client"
import { useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Terminal, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  sendSignInLinkToEmail,
  signInWithPopup,
  googleProvider,
  auth,
} from "@workspace/firebase-config/firebase"
import { Loader } from "@/components/loader"
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}
export default function AuthPage() {
  const { loading, user, systemUser } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSending) return
    setIsSending(true)
    try {
      const actionCodeSettings = {
        url: window.location.origin + "/auth/confirm",
        handleCodeInApp: true,
      }
      await sendSignInLinkToEmail(auth, email, actionCodeSettings)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("emailForSignIn", email)
      }
      setEmailSent(true)
      toast({
        title: "Email Sent",
        description: "Check your email for the login link.",
      })
    } catch (error) {
      console.error("Sign in error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send login email",
      })
    } finally {
      setIsSending(false)
    }
  }
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Google sign in error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to sign in with Google",
      })
    }
  }
  if (loading) {
    return <Loader />
  }
  if (user && !systemUser) {
    return (
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-12">
          <Terminal className="h-10 w-10 text-primary" />
          <span className="text-2xl font-semibold tracking-tight text-foreground">Adminish</span>
        </div>
        <div className="bg-card rounded-3xl p-8 border border-border">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Access Denied</h1>
            <p className="text-muted-foreground text-sm">
              You are signed in as {user.email}, but you don&apos;t have admin access.
              Please contact an administrator.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full h-12 rounded-xl"
            onClick={() => {
              auth.signOut()
            }}
          >
            Sign Out
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="w-full max-w-md relative z-10">
      <div className="flex items-center justify-center gap-3 mb-12">
        <Terminal className="h-10 w-10 text-primary" />
        <span className="text-2xl font-semibold tracking-tight text-foreground">Adminish</span>
      </div>
      <div className="bg-card rounded-3xl p-8 border border-border">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            {emailSent ? "Check your inbox" : "Admin Sign In"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {emailSent
              ? "We sent you a magic link to sign in"
              : "Sign in to access the Hunchy admin panel"}
          </p>
        </div>
        {emailSent ? (
          <div className="space-y-4 text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              We sent a sign-in link to <strong className="text-foreground">{email}</strong>
            </p>
            <Button
              variant="ghost"
              onClick={() => {
                setEmailSent(false)
                setEmail("")
              }}
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              Use a different email
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              <button
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-border rounded-xl transition-colors text-foreground hover:bg-accent"
              >
                <GoogleIcon className="h-5 w-5" />
                <span className="text-sm font-medium">Continue with Google</span>
              </button>
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-card px-4 text-xs uppercase tracking-wider text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSending}
                required
                className="h-12 rounded-xl"
              />
              <Button
                type="submit"
                disabled={!email || isSending}
                className="w-full h-12 rounded-xl"
              >
                {isSending ? "Sending..." : "Send Magic Link"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
