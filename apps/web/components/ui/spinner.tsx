import { HugeiconsIcon } from "@hugeicons/react"
import { Loading01Icon } from "@hugeicons/core-free-icons"
import { cn } from '@/lib/utils'
function Spinner({ className }: { className?: string }) {
  return (
    <HugeiconsIcon
      icon={Loading01Icon}
      size={16}
      role="status"
      aria-label="Loading"
      className={cn('size-4 animate-spin', className)}
    />
  )
}
export { Spinner }
