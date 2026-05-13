import { CheckCircle2, MessageCircleQuestion, Send, ThumbsDown, ThumbsUp } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { DashboardReplyMetrics } from "@/features/dashboard/types"
import {
  formatNumber,
  formatPercent,
  safeRate,
} from "@/features/dashboard/utils/dashboardFormatters"

interface ReplyMetricsChartProps {
  replyMetrics?: DashboardReplyMetrics
  totalMediaRequests?: number
  isLoading?: boolean
}

interface MetricRow {
  key: keyof DashboardReplyMetrics
  label: string
  description: string
  icon: typeof Send
  barClass: string
  iconClass: string
}

const METRICS: MetricRow[] = [
  {
    key: "templateSent",
    label: "Templates enviados",
    description: "Total de disparos no período",
    icon: Send,
    barClass: "[&>[data-slot=progress-indicator]]:bg-sky-500",
    iconClass: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  {
    key: "yesReply",
    label: "Respostas SIM",
    description: "Clientes que confirmaram",
    icon: ThumbsUp,
    barClass: "[&>[data-slot=progress-indicator]]:bg-emerald-500",
    iconClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    key: "noReply",
    label: "Respostas NÃO",
    description: "Clientes que recusaram",
    icon: ThumbsDown,
    barClass: "[&>[data-slot=progress-indicator]]:bg-zinc-500",
    iconClass: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  },
  {
    key: "invalidReply",
    label: "Respostas inválidas",
    description: "Conteúdo fora do padrão",
    icon: MessageCircleQuestion,
    barClass: "[&>[data-slot=progress-indicator]]:bg-amber-500",
    iconClass: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    key: "mediaSent",
    label: "Mídias enviadas",
    description: "Mídias entregues ao cliente",
    icon: CheckCircle2,
    barClass: "[&>[data-slot=progress-indicator]]:bg-emerald-600",
    iconClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
]

export function ReplyMetricsChart({
  replyMetrics,
  totalMediaRequests,
  isLoading = false,
}: ReplyMetricsChartProps) {
  const baseline = totalMediaRequests ?? 0

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Métricas de resposta</CardTitle>
        <CardDescription>
          Comparativo proporcional ao total de mídias solicitadas.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        {isLoading
          ? Array.from({ length: METRICS.length }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))
          : METRICS.map((metric) => {
              const value = replyMetrics?.[metric.key] ?? 0
              const ratio = safeRate(value, baseline)
              const Icon = metric.icon

              return (
                <div key={metric.key} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center rounded-md",
                          metric.iconClass,
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <div className="flex flex-col leading-tight min-w-0">
                        <span className="text-sm font-medium truncate">
                          {metric.label}
                        </span>
                        <span className="text-muted-foreground text-xs truncate">
                          {metric.description}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end leading-tight shrink-0">
                      <span className="text-sm font-semibold tabular-nums">
                        {formatNumber(value)}
                      </span>
                      {metric.key !== "templateSent" && baseline > 0 && (
                        <span className="text-muted-foreground text-[11px] tabular-nums">
                          {formatPercent(ratio)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Progress
                    value={ratio * 100}
                    className={cn("h-2", metric.barClass)}
                  />
                </div>
              )
            })}
      </CardContent>
    </Card>
  )
}
