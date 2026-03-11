"use client"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  GitBranchIcon,
  RotateLeft01Icon,
  SparklesIcon,
  GitCommitIcon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  AlertCircleIcon,
  SplitIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"
import { useState } from "react"
import { motion, useMotionTemplate, useMotionValue } from "framer-motion"
const features: { icon: IconSvgElement; title: string; description: string; status: string; example: string }[] = [
  {
    icon: CheckmarkCircle01Icon,
    title: "Code Quality Gates",
    description: "Detect code duplication, enforce O(n) complexity, catch unnecessary dependencies. AI writes fast, Hunchy keeps it clean and production-ready.",
    status: "available",
    example: "quality"
  },
  {
    icon: SparklesIcon,
    title: "Smart Refactoring Options",
    description: "Get 2-3 refactored alternatives for every change. Compare approaches, see trade-offs, choose what fits best. No more one-size-fits-all solutions.",
    status: "coming-soon",
    example: "messages"
  },
  {
    icon: SplitIcon,
    title: "Atomic Commit Generation",
    description: "Automatically splits messy AI-generated changesets into clean, logical commits. Each commit is focused, reviewable, and independently deployable.",
    status: "available",
    example: "atomic"
  },
  {
    icon: GitBranchIcon,
    title: "Pre-Commit Quality Checks",
    description: "Every commit is analyzed before it happens. Block bad code, duplicates, and architecture violations. Merge only what's production-ready.",
    status: "coming-soon",
    example: "branch"
  },
  {
    icon: RotateLeft01Icon,
    title: "Automated Code Cleanup",
    description: "Find and eliminate repeated code, simplify complex logic, reduce Big O complexity. Transform AI-generated code into maintainable software.",
    status: "coming-soon",
    example: "rollback"
  },
  {
    icon: RotateLeft01Icon,
    title: "Safe Refactoring",
    description: "Every refactoring is reversible. Review multiple options, apply changes safely, roll back if needed. Zero risk experimentation.",
    status: "coming-soon",
    example: "undo"
  },
]
function FeatureExample({ type, status }: { type: string; status: string }) {
  const [active, setActive] = useState(false)
  const disabled = status === "coming-soon"
  if (type === "atomic") return <AtomicIllustration disabled={disabled} />
  if (type === "branch") return <BranchesIllustration disabled={disabled} />
  if (type === "messages") return <MessageIllustration disabled={disabled} />
  if (type === "rollback") return <RollbackIllustration disabled={disabled} />
  if (type === "quality") return <QualityIllustration disabled={disabled} />
  if (type === "undo") return <SafeOpsIllustration active={active} setActive={setActive} disabled={disabled} />
  return <ComingSoonStub />
}
export function FeaturesSection() {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
    hover: { y: -8, transition: { duration: 0.3 } },
  }
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 bg-linear-to-b from-background via-card/20 to-background pointer-events-none" />
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            The bridge between <span className="bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">working code and production code</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Claude Code makes it work. Hunchy makes it clean, scalable, and maintainable.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="show"
              whileHover="hover"
              viewport={{ once: true, margin: "-100px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.25, 0.1, 0.25, 1]
              }}
              whileTap={{ scale: 0.98 }}
            >
              <SpotlightCard>
                <Card className="h-full border-border bg-card hover:border-blue-500/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-500 pointer-events-none" />
                  <CardContent className="p-6 relative z-10 flex flex-col h-full">
                    {feature.title !== "Intelligent Commit Splitting" && (
                      <div className="absolute top-4 right-4">
                        <span className="text-[10px] px-2 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                          COMING SOON
                        </span>
                      </div>
                    )}
                  <motion.div
                    className="h-12 w-12 rounded-lg bg-linear-to-br from-blue-500/10 to-cyan-500/10 flex items-center justify-center mb-4 group-hover:from-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-500"
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <HugeiconsIcon icon={feature.icon} size={24} className="h-6 w-6 text-blue-400 group-hover:text-cyan-400 transition-colors duration-500" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-2 text-foreground leading-tight h-[56px] overflow-hidden group-hover:bg-linear-to-r group-hover:from-blue-400 group-hover:to-cyan-400 group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed h-[72px] overflow-hidden">{feature.description}</p>
                  <div className="mt-4 h-44">
                    <FeatureExample type={feature.example} status={feature.status} />
                  </div>
                  </CardContent>
                </Card>
              </SpotlightCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
function SpotlightCard({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spotlight = useMotionTemplate`radial-gradient(600px circle at ${x}px ${y}px, rgba(59,130,246,0.08), transparent 40%)`
  const mask = useMotionTemplate`radial-gradient(300px circle at ${x}px ${y}px, black, transparent)`
  return (
    <motion.div
      className="relative group"
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        x.set(e.clientX - rect.left)
        y.set(e.clientY - rect.top)
      }}
    >
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit]"
        style={{ background: spotlight }}
      />
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[inherit] border border-primary/50"
        style={{ WebkitMaskImage: mask, maskImage: mask }}
      />
      {children}
    </motion.div>
  )
}
function ComingSoonStub() {
  return (
    <div className="h-full rounded-lg bg-background/50 border border-border/50 flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <HugeiconsIcon icon={Clock01Icon} size={12} className="h-3 w-3" />
        <span className="font-medium">Coming Soon</span>
      </div>
    </div>
  )
}
function AtomicIllustration({ disabled }: { disabled: boolean }) {
  return (
    <div className={`h-full rounded-lg bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/30 overflow-hidden p-3 ${disabled ? "opacity-70" : ""}`}>
      <div className="space-y-2">
        <div className="text-xs font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Before: 1 massive commit
        </div>
        <motion.div
          className="h-2 rounded-full bg-blue-500/25 border border-blue-500/20"
          animate={{ opacity: [1, 1, 0, 0, 1], y: [0, 0, 6, 6, 0] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 0.45, 0.8, 1] }}
        />
        <div className="text-xs text-muted-foreground">247 lines • 8 files • mixed concerns</div>
        <div className="my-2 border-t border-blue-500/20" />
        <div className="text-xs font-semibold bg-linear-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          After: 3 atomic commits
        </div>
        <div className="space-y-1">
          <motion.div
            className="grid grid-cols-3 gap-1"
            animate={{ opacity: [0, 0, 1, 1, 0], y: [6, 6, 0, 0, 6] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.35, 0.45, 0.8, 1] }}
          >
            <div className="h-2 rounded-full bg-cyan-400/30 border border-cyan-400/20" />
            <div className="h-2 rounded-full bg-cyan-400/30 border border-cyan-400/20" />
            <div className="h-2 rounded-full bg-cyan-400/30 border border-cyan-400/20" />
          </motion.div>
          <motion.div
            className="space-y-0.5"
            animate={{ opacity: [0, 0, 1, 1, 0], y: [4, 4, 0, 0, 4] }}
            transition={{ duration: 4, repeat: Infinity, times: [0, 0.45, 0.55, 0.8, 1] }}
          >
            {[
              "feat(auth): OAuth2 system",
              "feat(ui): Login forms",
              "test(auth): Test suite",
            ].map((t) => (
              <div key={t} className="flex items-center gap-2 text-xs text-cyan-400">
                <HugeiconsIcon icon={GitCommitIcon} size={12} className="h-3 w-3" />
                <span className="font-mono">{t}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
function BranchesIllustration({ disabled }: { disabled: boolean }) {
  return (
    <div className={`h-full rounded-lg bg-background/50 border border-border/50 overflow-hidden p-3 ${disabled ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-primary">Multiple branches</div>
        <HugeiconsIcon icon={GitBranchIcon} size={14} className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="mt-2 relative h-[92px] rounded-md border border-border/50 bg-background/30 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{ opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 3.6, repeat: Infinity }}
          style={{
            background: "radial-gradient(400px circle at 30% 30%, rgba(59,130,246,0.12), transparent 55%)",
          }}
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary/70" />
        <div className="absolute left-4 top-1/2 h-[1px] w-[60px] bg-border" />
        <div className="absolute left-[64px] top-[22px] h-[1px] w-[82px] bg-border" />
        <div className="absolute left-[64px] top-1/2 h-[1px] w-[82px] bg-border" />
        <div className="absolute left-[64px] top-[70px] h-[1px] w-[82px] bg-border" />
        <motion.div
          className="absolute top-[20px] left-[64px] h-1.5 w-1.5 rounded-full bg-cyan-400"
          animate={{ x: [0, 82, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-[48px] left-[64px] h-1.5 w-1.5 rounded-full bg-cyan-400"
          animate={{ x: [0, 82, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
        />
        <motion.div
          className="absolute top-[74px] left-[64px] h-1.5 w-1.5 rounded-full bg-cyan-400"
          animate={{ x: [0, 82, 0] }}
          transition={{ duration: 4.1, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
        />
      </div>
      <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
        {[
          ["feature/auth-system", "2 commits"],
          ["feature/billing", "2 commits"],
          ["feature/ui-refresh", "2 commits"],
        ].map(([b, c]) => (
          <div key={b} className="rounded-md border border-border/40 bg-background/30 px-2 py-1">
            <div className="font-mono text-primary truncate">{b}</div>
            <div className="text-muted-foreground">{c}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
function MessageIllustration({ disabled }: { disabled: boolean }) {
  return (
    <div className={`h-full rounded-lg bg-background/50 border border-border/50 overflow-hidden p-3 ${disabled ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold">AI-Generated Commit</div>
        <motion.div animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 1.6 }}>
          <HugeiconsIcon icon={SparklesIcon} size={14} className="h-3.5 w-3.5 text-secondary" />
        </motion.div>
      </div>
      <div className="mt-2 rounded-md border border-border/40 bg-background/30 px-2.5 py-2 font-mono text-xs text-muted-foreground overflow-hidden">
        <motion.div
          animate={{
            clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)", "inset(0 0% 0 0)", "inset(0 100% 0 0)"],
          }}
          transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.45, 0.75, 1] }}
        >
          feat(auth): implement OAuth2 flow
        </motion.div>
        <motion.div
          className="text-[10px]"
          animate={{
            clipPath: ["inset(0 100% 0 0)", "inset(0 0% 0 0)", "inset(0 0% 0 0)", "inset(0 100% 0 0)"],
          }}
          transition={{ duration: 4.2, repeat: Infinity, delay: 0.15, times: [0, 0.55, 0.78, 1] }}
        >
          with Google & GitHub providers
        </motion.div>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-secondary/70" />
          <span>summarized diff</span>
        </div>
        <span className="text-secondary">ready</span>
      </div>
    </div>
  )
}
function RollbackIllustration({ disabled }: { disabled: boolean }) {
  return (
    <div className={`h-full rounded-lg bg-background/50 border border-border/50 overflow-hidden p-3 ${disabled ? "opacity-70" : ""}`}>
      <div className="text-xs font-semibold text-primary">Granular rollback</div>
      <div className="mt-2 rounded-md border border-border/40 bg-background/30 px-2 py-1 text-muted-foreground text-[10px] font-mono">
        $ hunchy rollback --feature middleware
      </div>
      <div className="mt-2 relative h-[76px] rounded-md border border-border/40 bg-background/30 overflow-hidden">
        <div className="absolute inset-0 p-2 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <span>stack</span>
            <span>status</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-green-500">auth</div>
            <div className="text-[10px] text-green-500">kept</div>
          </div>
          <motion.div
            className="flex items-center justify-between rounded-sm border border-red-500/20 bg-red-500/10 px-2 py-0.5"
            animate={{ x: [0, 0, -140, -140, 0], opacity: [1, 1, 0, 0, 1] }}
            transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.35, 0.5, 0.78, 1] }}
          >
            <div className="text-[10px] text-red-400">middleware</div>
            <div className="text-[10px] text-red-400">removed</div>
          </motion.div>
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-green-500">db</div>
            <div className="text-[10px] text-green-500">kept</div>
          </div>
        </div>
      </div>
      <motion.div
        className="mt-2 flex items-center gap-2 text-xs text-green-500"
        animate={{ opacity: [0, 0, 1, 1, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, times: [0, 0.52, 0.62, 0.82, 1] }}
      >
        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="h-3 w-3" />
        <span>Rollback isolated</span>
      </motion.div>
    </div>
  )
}
function QualityIllustration({ disabled }: { disabled: boolean }) {
  return (
    <div className={`h-full rounded-lg bg-background/50 border border-border/50 overflow-hidden p-3 ${disabled ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-primary">Quality gates</div>
        <div className="text-[10px] text-muted-foreground">scan</div>
      </div>
      <div className="mt-2 relative h-[108px] rounded-md border border-border/40 bg-background/30 overflow-hidden font-mono text-[10px] text-muted-foreground">
        <motion.div
          className="absolute left-0 right-0 h-6 bg-linear-to-b from-transparent via-primary/15 to-transparent"
          animate={{ y: [-24, 108] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 p-2 space-y-1">
          <div>function normalize(input) {"{"}</div>
          <div className="pl-2">trim(input)</div>
          <div className="pl-2">lowercase(input)</div>
          <motion.div
            className="pl-2 rounded-sm bg-primary/10 border border-primary/20"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 0.2 }}
          >
            trim(input)
          </motion.div>
          <motion.div
            className="pl-2 rounded-sm bg-primary/10 border border-primary/20"
            animate={{ opacity: [0.35, 1, 0.35] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: 0.45 }}
          >
            lowercase(input)
          </motion.div>
          <div>{"}"}</div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-[10px]">
        <div className="rounded-md border border-border/40 bg-background/30 px-2 py-1">
          <div className="text-primary font-medium">duplication</div>
          <div className="text-muted-foreground">blocked</div>
        </div>
        <div className="rounded-md border border-border/40 bg-background/30 px-2 py-1">
          <div className="text-primary font-medium">complexity</div>
          <div className="text-muted-foreground">O(n)</div>
        </div>
      </div>
    </div>
  )
}
function SafeOpsIllustration({
  active,
  setActive,
  disabled,
}: {
  active: boolean
  setActive: (v: boolean) => void
  disabled: boolean
}) {
  return (
    <motion.div
      className={`h-full rounded-lg bg-background/50 border border-border/50 overflow-hidden p-3 cursor-pointer hover:border-primary/50 transition-colors ${disabled ? "opacity-70" : ""}`}
      onClick={() => setActive(!active)}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-primary">Snapshots</div>
        <motion.div animate={{ rotate: active ? 180 : 0 }} transition={{ duration: 0.35, ease: "easeInOut" }}>
          <HugeiconsIcon icon={RotateLeft01Icon} size={14} className="h-3.5 w-3.5 text-primary" />
        </motion.div>
      </div>
      <div className="mt-3 relative h-[60px] rounded-md border border-border/40 bg-background/30 overflow-hidden">
        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[1px] bg-border" />
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-muted-foreground/40"
            style={{ left: `${12 + i * 38}%` }}
          />
        ))}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-primary shadow-[0_0_18px_rgba(59,130,246,0.35)]"
          animate={{ left: active ? "12%" : "88%" }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          style={{ left: "88%" }}
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground">
        {active ? (
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="h-3 w-3 text-green-500" />
            Restored from snapshot
          </span>
        ) : (
          <span className="inline-flex items-center gap-2">
            <HugeiconsIcon icon={AlertCircleIcon} size={12} className="h-3 w-3 text-muted-foreground" />
            Click to rollback safely
          </span>
        )}
      </div>
    </motion.div>
  )
}
