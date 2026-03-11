"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { CheckmarkCircle01Icon, Loading01Icon } from "@hugeicons/core-free-icons"
export function EarlyAccessForm() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLoading(false)
    setSubmitted(true)
    setEmail("")
    setName("")
  }
  if (submitted) {
    return (
      <Card className="border-secondary/30 bg-linear-to-br from-secondary/5 to-transparent p-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-secondary/20 flex items-center justify-center">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={24} className="h-6 w-6 text-secondary" />
          </div>
        </div>
        <h3 className="text-xl font-semibold mb-2">You're on the list!</h3>
        <p className="text-muted-foreground mb-6">
          We'll send you an email when early access is available. In the meantime, you can install the CLI:
        </p>
        <div className="inline-block px-4 py-2 rounded-lg bg-card border border-border font-mono text-sm">
          <span className="text-muted-foreground">$</span> <span className="text-secondary">npx</span>{" "}
          <span className="text-foreground">hunchy init</span>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          Note: CLI authentication will be enabled once you receive early access
        </p>
      </Card>
    )
  }
  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm p-8">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2">Try for Free</h3>
        <p className="text-muted-foreground">
          Get started with Hunchy today. Free tier available, no credit card required.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="bg-background"
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-background"
          />
        </div>
        <Button type="submit" size="lg" className="w-full bg-secondary hover:bg-secondary/90 text-background" disabled={loading}>
          {loading ? (
            <>
              <HugeiconsIcon icon={Loading01Icon} size={16} className="mr-2 h-4 w-4 animate-spin" />
              Getting Started...
            </>
          ) : (
            "Get Started"
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Install the CLI instantly. Authenticate after signup.
        </p>
      </form>
    </Card>
  )
}
