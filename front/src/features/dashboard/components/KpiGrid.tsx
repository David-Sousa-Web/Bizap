import {
  CheckCheck,
  FolderKanban,
  Send,
  ThumbsUp,
  TrendingUp,
  Users,
} from "lucide-react"

import type { DashboardSummary } from "@/features/dashboard/types"
import {
  formatNumber,
  formatPercent,
} from "@/features/dashboard/utils/dashboardFormatters"
import { KpiCard } from "@/features/dashboard/components/KpiCard"

interface KpiGridProps {
  summary?: DashboardSummary
  isLoading?: boolean
}

export function KpiGrid({ summary, isLoading = false }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      <KpiCard
        label="Projetos"
        value={summary ? formatNumber(summary.totalProjects) : "0"}
        icon={FolderKanban}
        isLoading={isLoading}
      />
      <KpiCard
        label="Números"
        value={summary ? formatNumber(summary.totalNumbers) : "0"}
        icon={Users}
        isLoading={isLoading}
      />
      <KpiCard
        label="Solicitações"
        value={summary ? formatNumber(summary.totalMediaRequests) : "0"}
        icon={Send}
        isLoading={isLoading}
      />
      <KpiCard
        label="Mídias entregues"
        value={summary ? formatNumber(summary.totalDeliveredMedia) : "0"}
        icon={CheckCheck}
        tone="success"
        isLoading={isLoading}
      />
      <KpiCard
        label="Taxa de confirmação"
        value={summary ? formatPercent(summary.confirmationRate) : "0%"}
        icon={ThumbsUp}
        tone="success"
        hint="Confirmados ÷ Solicitações"
        isLoading={isLoading}
      />
      <KpiCard
        label="Taxa de entrega"
        value={summary ? formatPercent(summary.deliveryRate) : "0%"}
        icon={TrendingUp}
        tone="success"
        hint="Mídias entregues ÷ Solicitações"
        isLoading={isLoading}
      />
    </div>
  )
}
