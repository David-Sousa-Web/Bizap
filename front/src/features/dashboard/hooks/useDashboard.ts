import { useQuery, keepPreviousData } from "@tanstack/react-query"
import { dashboardService } from "@/services/dashboardService"
import type { DashboardFilters } from "@/features/dashboard/types"

export function useDashboard(filters: DashboardFilters) {
  return useQuery({
    queryKey: ["dashboard", filters],
    queryFn: () => dashboardService.get(filters),
    placeholderData: keepPreviousData,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  })
}
