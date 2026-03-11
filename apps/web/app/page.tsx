import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { BeforeAfterSection } from "@/components/before-after-section"
import { PricingSection } from "@/components/pricing-section"
import { IntegrationsSection } from "@/components/integrations-section"
import { EarlyAccessSection } from "@/components/early-access-section"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { CliDemoSection } from "@/components/cli-demo-section"
import { CreatorQuoteSection } from "@/components/creator-quote-section"
import { MultiAgentExampleSection } from "@/components/multi-agent-example-section"
export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <CliDemoSection />
      <BeforeAfterSection />
      <FeaturesSection />
      <MultiAgentExampleSection />
      <IntegrationsSection />
      <CreatorQuoteSection />
      <PricingSection />
      <EarlyAccessSection />
      <Footer />
    </main>
  )
}
