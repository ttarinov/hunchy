"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CodeBlock } from "./code-block"
import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon } from "@hugeicons/core-free-icons"
interface ConfigExampleProps {
  title: string
  description: string
  config: string
  explanation?: string
}
export function ConfigExample({ title, description, config, explanation }: ConfigExampleProps) {
  return (
    <Card className="border-blue-500/30 bg-card/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <HugeiconsIcon icon={Settings01Icon} size={20} className="h-5 w-5 text-primary" />
          <div>
            <CardTitle>{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <CodeBlock code={config} language="json" showTerminal={false} />
        {explanation && (
          <div className="p-4 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground">{explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
