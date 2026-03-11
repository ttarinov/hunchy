"use client"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
const integrations = [
  {
    name: "GitHub",
    description: "Version control integration",
    logo: (
      <svg viewBox="0 0 24 24" className="h-12 w-12" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
  },
  {
    name: "Cursor",
    description: "AI-powered IDE",
    logo: (
      <Image
        src="https://img.icons8.com/color/512/cursor-ai.png"
        alt="Cursor AI"
        width={48}
        height={48}
        className="h-12 w-12"
      />
    ),
  },
  {
    name: "Claude Code",
    description: "AI coding assistant",
    logo: (
      <Image
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/Claude_AI_symbol.svg/1024px-Claude_AI_symbol.svg.png"
        alt="Claude Code"
        width={48}
        height={48}
        className="h-12 w-12"
      />
    ),
  },
]
export function IntegrationsSection() {
  return (
    <section id="integrations" className="py-16 relative">
      <div className="absolute inset-0 bg-linear-to-b from-card/10 to-background" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            Works with your <span className="text-secondary">favorite tools</span>
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto">
            Seamless integration with the tools you already use
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {integrations.map((integration, index) => (
            <Card
              key={index}
              className="border-border bg-card hover:border-secondary/50 transition-all duration-300 group"
            >
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center mx-auto mb-4 text-foreground group-hover:text-secondary transition-colors">
                  {integration.logo}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{integration.name}</h3>
                <p className="text-muted-foreground text-sm">{integration.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
