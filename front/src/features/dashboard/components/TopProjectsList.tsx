import { useNavigate } from "react-router-dom"
import { ArrowRight, Building2, FolderKanban } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import type { DashboardProjectSummary } from "@/features/dashboard/types"
import {
  formatNumber,
  formatPercent,
  safeRate,
} from "@/features/dashboard/utils/dashboardFormatters"

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

interface TopProjectsListProps {
  projects?: DashboardProjectSummary[]
  isLoading?: boolean
  limit?: number
}

export function TopProjectsList({
  projects,
  isLoading = false,
  limit = 5,
}: TopProjectsListProps) {
  const navigate = useNavigate()
  const visibleProjects = (projects ?? []).slice(0, limit)
  const hasMore = (projects?.length ?? 0) > limit

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top projetos</CardTitle>
        <CardDescription>
          Ranking pelos projetos com maior volume de solicitações.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {isLoading ? (
          Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          ))
        ) : visibleProjects.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderKanban />
              </EmptyMedia>
              <EmptyTitle>Sem projetos</EmptyTitle>
              <EmptyDescription>
                Nenhum projeto com atividade no período selecionado.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          visibleProjects.map((project) => {
            const ratio = safeRate(
              project.deliveredMedia,
              project.totalMediaRequests,
            )

            return (
              <button
                key={project.id}
                type="button"
                onClick={() => navigate(`/projetos/${project.id}`)}
                className="flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/40 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-2"
              >
                <Avatar size="lg" className="size-11 shrink-0">
                  {project.image && (
                    <AvatarImage src={project.image} alt={project.name} />
                  )}
                  <AvatarFallback className="text-[13px] font-semibold">
                    {getInitials(project.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col gap-1.5 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">
                      {project.name}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-muted-foreground shrink-0">
                      {formatNumber(project.totalMediaRequests)} envios
                    </span>
                  </div>

                  {project.agency && (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground truncate">
                      <Building2 className="size-3 shrink-0" />
                      {project.agency}
                    </span>
                  )}

                  <div className="flex items-center gap-2">
                    <Progress
                      value={ratio * 100}
                      className="h-1.5 flex-1 [&>[data-slot=progress-indicator]]:bg-emerald-500"
                    />
                    <span className="text-[11px] font-mono tabular-nums text-muted-foreground shrink-0">
                      {formatPercent(ratio)}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground">
                    <span className="tabular-nums">
                      {formatNumber(project.totalNumbers)} contatos
                    </span>
                    <span className="tabular-nums">
                      {formatNumber(project.deliveredMedia)} entregues
                    </span>
                    {project.failed > 0 && (
                      <span className="tabular-nums text-destructive">
                        {formatNumber(project.failed)} falhas
                      </span>
                    )}
                    <span className="tabular-nums">
                      {formatPercent(project.confirmationRate)} confirm.
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}

        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="self-end"
            onClick={() => navigate("/projetos")}
          >
            Ver todos
            <ArrowRight className="size-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
