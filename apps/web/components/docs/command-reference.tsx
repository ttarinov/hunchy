"use client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CodeBlock } from "./code-block"
import { Badge } from "@/components/ui/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ComputerTerminal01Icon } from "@hugeicons/core-free-icons"
interface CommandOption {
  flag: string
  description: string
  required?: boolean
}
interface CommandReferenceProps {
  name: string
  description: string
  usage: string
  examples?: string[]
  options?: CommandOption[]
  notes?: string[]
}
export function CommandReference({
  name,
  description,
  usage,
  examples = [],
  options = [],
  notes = [],
}: CommandReferenceProps) {
  return (
    <Card className="border-blue-500/30 bg-card/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <HugeiconsIcon icon={ComputerTerminal01Icon} size={20} className="h-5 w-5 text-primary" />
          <CardTitle className="text-2xl font-mono">{name}</CardTitle>
        </div>
        <CardDescription className="text-base mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wide">
            Usage
          </h4>
          <CodeBlock code={usage} showTerminal={false} />
        </div>
        {options.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Options
            </h4>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                  <code className="text-sm font-mono text-primary flex-shrink-0">
                    {option.flag}
                  </code>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">{option.description}</p>
                    {option.required && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {examples.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Examples
            </h4>
            <div className="space-y-3">
              {examples.map((example, index) => (
                <CodeBlock key={index} code={example} showTerminal={false} />
              ))}
            </div>
          </div>
        )}
        {notes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
              Notes
            </h4>
            <ul className="space-y-2">
              {notes.map((note, index) => (
                <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
