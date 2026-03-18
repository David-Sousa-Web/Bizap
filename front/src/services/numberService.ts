import { api } from "@/lib/api"
import type { PaginatedApiResponse, PaginationParams } from "@/types/api"
import type { ProjectNumber } from "@/features/projects/types"

async function listByProject(
  projectId: string,
  params?: PaginationParams,
): Promise<PaginatedApiResponse<ProjectNumber[]>> {
  const response = await api.get<PaginatedApiResponse<ProjectNumber[]>>(
    `/projects/${projectId}/numbers`,
    { params },
  )
  return response.data
}

export const numberService = Object.freeze({ listByProject })

export type NumberService = typeof numberService
