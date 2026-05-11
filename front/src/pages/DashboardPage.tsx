import { useCallback, useMemo } from "react"
import { useSearchParams } from "react-router-dom"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale/pt-BR"
import { AlertCircle, RefreshCw } from "lucide-react"

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/features/dashboard/hooks/useDashboard"
import { DashboardFilters } from "@/features/dashboard/components/DashboardFilters"
import { KpiGrid } from "@/features/dashboard/components/KpiGrid"
import { AttentionPanel } from "@/features/dashboard/components/AttentionPanel"
import { FunnelChart } from "@/features/dashboard/components/FunnelChart"
import { ReplyMetricsChart } from "@/features/dashboard/components/ReplyMetricsChart"
import { TopProjectsList } from "@/features/dashboard/components/TopProjectsList"
import { RecentActivityList } from "@/features/dashboard/components/RecentActivityList"

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()

  const projectId = searchParams.get("projectId") ?? undefined
  const from = searchParams.get("from") ?? undefined
  const to = searchParams.get("to") ?? undefined

  const filters = useMemo(
    () => ({ projectId, from, to }),
    [projectId, from, to],
  )

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
    refetch,
    dataUpdatedAt,
  } = useDashboard(filters)

  const dashboard = response?.data ?? null

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          for (const [key, value] of Object.entries(updates)) {
            if (value) {
              next.set(key, value)
            } else {
              next.delete(key)
            }
          }
          return next
        },
        { replace: true },
      )
    },
    [setSearchParams],
  )

  const handleProjectChange = useCallback(
    (value: string | undefined) => {
      updateParams({ projectId: value })
    },
    [updateParams],
  )

  const handlePeriodChange = useCallback(
    (nextFrom: string | undefined, nextTo: string | undefined) => {
      updateParams({ from: nextFrom, to: nextTo })
    },
    [updateParams],
  )

  const updatedAtLabel = useMemo(() => {
    if (!dataUpdatedAt) return null
    return formatDistanceToNow(new Date(dataUpdatedAt), {
      addSuffix: true,
      locale: ptBR,
    })
  }, [dataUpdatedAt])

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Visão geral da sua operação de envios via WhatsApp.
            {updatedAtLabel && !isLoading && (
              <span className="ml-1.5">
                Atualizado {updatedAtLabel}.
              </span>
            )}
          </p>
        </div>

        <DashboardFilters
          projectId={projectId}
          from={from}
          to={to}
          isFetching={isFetching}
          onProjectChange={handleProjectChange}
          onPeriodChange={handlePeriodChange}
          onRefresh={() => refetch()}
        />
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Erro ao carregar a dashboard</AlertTitle>
          <AlertDescription>
            Não foi possível buscar os dados da dashboard. Tente novamente em
            instantes.
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw />
              Tentar novamente
            </Button>
          </AlertAction>
        </Alert>
      )}

      {!isError && (
        <>
          <KpiGrid summary={dashboard?.summary} isLoading={isLoading} />

          <AttentionPanel
            attention={dashboard?.attention}
            isLoading={isLoading}
          />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <FunnelChart
              mediaStatus={dashboard?.mediaStatus}
              isLoading={isLoading}
            />
            <ReplyMetricsChart
              replyMetrics={dashboard?.replyMetrics}
              isLoading={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopProjectsList
              projects={dashboard?.projects}
              isLoading={isLoading}
            />
            <RecentActivityList
              items={dashboard?.recentActivity}
              isLoading={isLoading}
            />
          </div>
        </>
      )}
    </div>
  )
}
