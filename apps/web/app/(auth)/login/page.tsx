"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, Github01Icon, ComputerTerminal01Icon } from "@hugeicons/core-free-icons"
import { useToast } from "@/components/ui/use-toast"
import { 
  sendSignInLinkToEmail, 
  auth, 
  signInWithPopup, 
  githubProvider, 
  googleProvider 
} from "@workspace/firebase-config/firebase"
import Image from "next/image"
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
export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [isGithubLoading, setIsGithubLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard")
    }
  }, [user, loading, router])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || isSending) return
    setIsSending(true)
    try {
      const actionCodeSettings = {
        url: window.location.origin + "/login/confirm",
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
        description: error instanceof Error ? error.message : "Failed to send login email",
      })
    } finally {
      setIsSending(false)
    }
  }
  const handleGithubSignIn = async () => {
    setIsGithubLoading(true)
    try {
      await signInWithPopup(auth, githubProvider)
    } catch (error) {
      console.error("GitHub sign in error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with GitHub",
      })
    } finally {
      setIsGithubLoading(false)
    }
  }
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error("Google sign in error:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in with Google",
      })
    } finally {
      setIsGoogleLoading(false)
    }
  }
  if (loading || user) {
    return (
      <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#38BDF8]"></div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#38BDF8]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0EA5E9]/8 rounded-full blur-3xl" />
      <div className="w-full max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3 mb-12">
          <HugeiconsIcon icon={ComputerTerminal01Icon} size={40} className="h-10 w-10 text-[#38BDF8]" />
          <span className="text-2xl font-semibold tracking-tight text-white">Hunchy</span>
        </div>
        <div className="bg-[#111827] rounded-3xl p-8 border border-[#1F2937]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-white mb-2">Welcome back</h1>
            <p className="text-[#9CA3AF] text-sm">
              {emailSent
                ? "Check your inbox for the magic link"
                : "Sign in to continue your journey"}
            </p>
          </div>
          {emailSent ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-[#38BDF8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <HugeiconsIcon icon={Mail01Icon} size={32} className="h-8 w-8 text-[#38BDF8]" />
              </div>
              <p className="text-sm text-[#9CA3AF]">
                We sent a sign-in link to <strong className="text-white">{email}</strong>
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setEmailSent(false)
                  setEmail("")
                }}
                className="text-[#38BDF8] hover:text-[#38BDF8] hover:bg-[#38BDF8]/10"
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={true}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#1F2937] rounded-xl transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <GoogleIcon className="h-5 w-5" />
                  <span className="text-sm font-medium">Continue with Google</span>
                </button>
                <button 
                  onClick={handleGithubSignIn}
                  disabled={true}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-[#1F2937] rounded-xl transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <HugeiconsIcon icon={Github01Icon} size={20} className="h-5 w-5 text-[#9CA3AF]" />
                  <span className="text-sm font-medium">Continue with GitHub</span>
                </button>
              </div>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#1F2937]" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-[#111827] px-4 text-xs uppercase tracking-wider text-[#6B7280]">
                    or continue with email
                  </span>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSending}
                  required
                  className="h-12 rounded-xl bg-[#0A0F1C] border-[#1F2937] text-white focus:border-[#38BDF8] focus:ring-[#38BDF8] placeholder:text-[#4B5563]"
                />
                <Button
                  type="submit"
                  disabled={!email || isSending}
                  className="w-full h-12 rounded-xl bg-linear-to-r from-[#38BDF8] to-[#0EA5E9] hover:from-[#7DD3FC] hover:to-[#38BDF8] text-[#0A0F1C] font-medium transition-all"
                >
                  {isSending ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            </>
          )}
        </div>
        <p className="text-center text-xs text-[#6B7280] mt-8">
          By continuing, you agree to our{" "}
          <a href="#" className="text-[#38BDF8] hover:underline">Terms</a>{" "}
          and{" "}
          <a href="#" className="text-[#38BDF8] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  )
}
