"use client"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { Github01Icon, Linkedin01Icon } from "@hugeicons/core-free-icons"
import Link from "next/link"
const creatorInfo = {
  name: "Alex Tatarinov",
  imageUrl: "https://media.licdn.com/dms/image/v2/C5603AQH0zVfxvYJOEQ/profile-displayphoto-shrink_800_800/profile-displayphoto-shrink_800_800/0/1634609039483?e=1769040000&v=beta&t=oXPCN9fqcCWura1qYzSfOns6KXc6qqPN7watAbiusC8",
  quote: "I built Hunchy to solve my own problem with messy commits. I really like to build fast, and sometimes using multiple AI agents, so it was many times the case that I made more changes than it's logically reasonable to make in one commit or branch. So I built something that actually works for me.",
  subtitle: "Built $180K ARR product in 3 months, using this workflow",
  linkedinUrl: "https://www.linkedin.com/in/tatarinov-alx/",
  githubUrl: "https://github.com/ttarinov"
}
export function CreatorQuoteSection() {
  const initials = creatorInfo.name
    .split(" ")
    .map((n) => n[0])
    .join("")
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-b from-background via-primary/5 to-background pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.1, 0.25, 1]
            }}
            className="text-center"
          >
            <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed">
              <span className="text-primary">"</span>
              {creatorInfo.quote}
              <span className="text-primary">"</span>
            </blockquote>
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-4">
                <Avatar className="h-16 w-16 border-2 border-primary/20">
                  <AvatarImage src={creatorInfo.imageUrl} alt={creatorInfo.name} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="font-semibold text-lg text-foreground">{creatorInfo.name}</div>
                  {}
                  <div className="text-xs text-secondary mt-1">{creatorInfo.subtitle}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={creatorInfo.linkedinUrl}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <HugeiconsIcon icon={Linkedin01Icon} size={20} className="h-5 w-5" />
                </Link>
                <Link
                  href={creatorInfo.githubUrl}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                >
                  <HugeiconsIcon icon={Github01Icon} size={20} className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
