import { HugeiconsIcon } from "@hugeicons/react"
import {
  ComputerTerminal01Icon,
  CodeIcon,
  Login01Icon,
} from "@hugeicons/core-free-icons"
import Link from "next/link"
export function EarlyAccessSection() {
  return (
    <section id="early-access" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              Ready to make your code{" "}
              <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">clean</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-4 text-pretty">
              Join developers who are making their version control intelligent, auditable, and effortless.
            </p>
          </div>
          <div className="max-w-2xl mx-auto mb-12">
            <div className="space-y-6">
              <div className="bg-card/30 backdrop-blur-sm border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={ComputerTerminal01Icon} size={20} className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">1. Install the CLI</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Install with a single command. Works on macOS, Linux, and Windows.
                    </p>
                    <div className="inline-block px-3 py-1.5 rounded bg-background border border-border font-mono text-xs">
                      <span className="text-muted-foreground">$</span>{" "}
                      <span className="text-secondary">curl</span>{" "}
                      <span className="text-secondary">-fsSL</span>{" "}
                      <span className="text-foreground">https://hunchy-4a0dc.web.app/install.sh</span>{" "}
                      <span className="text-muted-foreground">|</span>{" "}
                      <span className="text-primary">bash</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-card/30 backdrop-blur-sm border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={Login01Icon} size={20} className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">2. Sign In</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Create an account or sign in to unlock all features.
                    </p>
                    <Link 
                      href="/login" 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      <HugeiconsIcon icon={Login01Icon} size={16} className="h-4 w-4" />
                      Sign In
                    </Link>
                  </div>
                </div>
              </div>
              <div className="bg-card/30 backdrop-blur-sm border border-border rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <HugeiconsIcon icon={CodeIcon} size={20} className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">3. Start Using</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                      Navigate to your project and run Hunchy to split your changes into logical commits.
                    </p>
                    <div className="inline-block px-3 py-1.5 rounded bg-background border border-border font-mono text-xs">
                      <span className="text-muted-foreground">$</span>{" "}
                      <span className="text-primary">hunchy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground">
            Open source • Free tier available • No credit card required
          </p>
        </div>
      </div>
    </section>
  )
}
