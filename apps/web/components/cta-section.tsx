import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Github01Icon } from "@hugeicons/core-free-icons"
export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
            Ready to make your code{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-secondary">clean</span>?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 text-pretty">
            Join developers who are making their version control intelligent, auditable, and effortless.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 group">
              Get Started Now
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="border-border hover:bg-card bg-transparent">
              <HugeiconsIcon icon={Github01Icon} size={16} className="mr-2 h-4 w-4" />
              View on GitHub
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-8">Open source • Free to use • No credit card required</p>
        </div>
      </div>
    </section>
  )
}
