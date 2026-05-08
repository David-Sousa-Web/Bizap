import { api } from "@/lib/api"
import type { ApiResponse } from "@/types/api"
import type {
  DashboardData,
  DashboardFilters,
} from "@/features/dashboard/types"

async function get(
  filters?: DashboardFilters,
): Promise<ApiResponse<DashboardData>> {
  const response = await api.get<ApiResponse<DashboardData>>("/dashboard", {
    params: {
      projectId: filters?.projectId || undefined,
      from: filters?.from || undefined,
      to: filters?.to || undefined,
    },
  })
  return response.data
}

export const dashboardService = Object.freeze({ get })

export type DashboardService = typeof dashboardService
