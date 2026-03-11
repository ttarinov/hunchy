"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  auth,
} from "@workspace/firebase-config/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Terminal, CheckCircle2, XCircle } from "lucide-react"
import { Loader } from "@/components/loader"
export default function ConfirmPage() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error" | "email_needed">("loading")
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const completeSignIn = async (emailToUse: string) => {
    try {
      await signInWithEmailLink(auth, emailToUse, window.location.href)
      window.localStorage.removeItem("emailForSignIn")
      setStatus("success")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch (err) {
      console.error("Sign in error:", err)
      setError(err instanceof Error ? err.message : "Failed to complete sign in")
      setStatus("error")
    }
  }
  useEffect(() => {
    if (typeof window === "undefined") return
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem("emailForSignIn")
      if (storedEmail) {
        completeSignIn(storedEmail)
      } else {
        setStatus("email_needed")
      }
    } else {
      setError("Invalid sign-in link")
      setStatus("error")
    }
  }, [])
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setStatus("loading")
      completeSignIn(email)
    }
  }
  if (status === "loading") {
    return <Loader />
  }
  if (status === "success") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Adminish</span>
          </div>
          <CheckCircle2 className="h-16 w-16 mx-auto text-green-500 mb-4" />
          <CardTitle>Success!</CardTitle>
          <CardDescription>You have been signed in. Redirecting...</CardDescription>
        </CardHeader>
      </Card>
    )
  }
  if (status === "error") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Terminal className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Adminish</span>
          </div>
          <XCircle className="h-16 w-16 mx-auto text-destructive mb-4" />
          <CardTitle>Sign In Failed</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" onClick={() => router.push("/auth")}>
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Terminal className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">Adminish</span>
        </div>
        <CardTitle>Confirm Your Email</CardTitle>
        <CardDescription>
          Please enter the email you used to request the sign-in link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={!email}>
            Complete Sign In
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
