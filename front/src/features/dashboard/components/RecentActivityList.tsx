import { useNavigate } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { Activity } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import { getMediaRequestStatusDisplay } from "@/features/projects/utils/mediaRequestStatus"
import type { DashboardActivityItem } from "@/features/dashboard/types"

interface RecentActivityListProps {
  items?: DashboardActivityItem[]
  isLoading?: boolean
}

export function RecentActivityList({
  items,
  isLoading = false,
}: RecentActivityListProps) {
  const navigate = useNavigate()
  const list = items ?? []

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Atividade recente</CardTitle>
        <CardDescription>
          Últimas 20 movimentações de mídia em todos os seus projetos.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col gap-3 px-6 pb-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="size-9 rounded-full" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="px-6 pb-6">
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Activity />
                </EmptyMedia>
                <EmptyTitle>Sem atividade recente</EmptyTitle>
                <EmptyDescription>
                  Nada foi processado no período selecionado.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </div>
        ) : (
          <ScrollArea className="h-[480px]">
            <ul className="flex flex-col">
              {list.map((item) => {
                const display = getMediaRequestStatusDisplay(item.status)
                const Icon = display.icon
                const updatedAt = new Date(item.updatedAt)

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/projetos/${item.projectId}?tab=numeros`)
                      }
                      className="flex w-full items-center gap-3 border-b px-6 py-3 text-left transition-colors last:border-0 hover:bg-accent/40 focus-visible:bg-accent/40 focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full border",
                          display.tone,
                        )}
                        aria-hidden="true"
                      >
                        <Icon className="size-4" />
                      </span>

                      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">
                            {item.projectName}
                          </span>
                          <time
                            dateTime={item.updatedAt}
                            className="text-muted-foreground text-xs shrink-0 tabular-nums"
                          >
                            {formatDistanceToNow(updatedAt, {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </time>
                        </div>
                        <span className="text-muted-foreground text-xs truncate">
                          {display.label} · {display.description}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
