import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  tone?: "default" | "success" | "warning" | "destructive"
  isLoading?: boolean
}

const TONE_STYLES: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "bg-muted text-foreground",
  success:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
  isLoading = false,
}: KpiCardProps) {
  return (
    <Card size="sm" className="transition-colors">
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            {label}
          </span>
          <span
            className={cn(
              "flex size-8 items-center justify-center rounded-lg",
              TONE_STYLES[tone],
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>

        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <span className="text-2xl font-bold tabular-nums leading-none">
            {value}
          </span>
        )}

        {hint && !isLoading && (
          <span className="text-muted-foreground text-xs">{hint}</span>
        )}
      </CardContent>
    </Card>
  )
}
