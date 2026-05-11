import {
  AlertTriangle,
  Clock,
  ServerOff,
  XCircle,
  XOctagon,
  type LucideIcon,
} from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import type { DashboardAttention } from "@/features/dashboard/types"
import { formatNumber } from "@/features/dashboard/utils/dashboardFormatters"

interface AttentionItem {
  key: keyof DashboardAttention
  label: string
  description: string
  icon: LucideIcon
  activeTone: string
}

const ATTENTION_ITEMS: AttentionItem[] = [
  {
    key: "pendingRequests",
    label: "Solicitações pendentes",
    description: "Aguardando disparo do template.",
    icon: Clock,
    activeTone:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    key: "declinedRequests",
    label: "Recusadas",
    description: "Cliente recusou o envio.",
    icon: XCircle,
    activeTone:
      "border-zinc-500/40 bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  },
  {
    key: "failedRequests",
    label: "Falhas",
    description: "Erros no disparo ou processamento.",
    icon: AlertTriangle,
    activeTone:
      "border-destructive/40 bg-destructive/10 text-destructive",
  },
  {
    key: "invalidResponseLimit",
    label: "Limite de respostas",
    description: "Clientes que excederam tentativas.",
    icon: XOctagon,
    activeTone:
      "border-destructive/40 bg-destructive/10 text-destructive",
  },
  {
    key: "projectsWithoutZabbixHost",
    label: "Sem host Zabbix",
    description: "Projetos não monitorados.",
    icon: ServerOff,
    activeTone:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
]

interface AttentionPanelProps {
  attention?: DashboardAttention
  isLoading?: boolean
}

export function AttentionPanel({
  attention,
  isLoading = false,
}: AttentionPanelProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <AlertTriangle
          className="text-muted-foreground size-4"
          aria-hidden="true"
        />
        <h2 className="text-sm font-semibold tracking-tight">
          Pontos de atenção
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {ATTENTION_ITEMS.map((item) => {
          const Icon = item.icon
          const value = attention?.[item.key] ?? 0
          const isActive = value > 0

          return (
            <Card
              key={item.key}
              size="sm"
              className={cn(
                "transition-colors",
                !isActive && "opacity-60",
              )}
            >
              <CardContent className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-lg border",
                    isActive
                      ? item.activeTone
                      : "border-border bg-muted text-muted-foreground",
                  )}
                  aria-hidden="true"
                >
                  <Icon className="size-4" />
                </span>

                <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                  <span className="text-muted-foreground text-xs leading-tight">
                    {item.label}
                  </span>
                  {isLoading ? (
                    <Skeleton className="h-7 w-12 my-0.5" />
                  ) : (
                    <span className="text-2xl font-bold tabular-nums leading-none">
                      {formatNumber(value)}
                    </span>
                  )}
                  <span className="text-muted-foreground text-[11px] leading-tight truncate">
                    {item.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
