import { api } from "@/lib/api"
import type { ApiResponse, PaginatedApiResponse, PaginationParams } from "@/types/api"
import type { CreateNumberPayload, ProjectNumber } from "@/features/projects/types"

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

async function create(
  projectId: string,
  apiKey: string,
  payload: CreateNumberPayload,
): Promise<ApiResponse<ProjectNumber>> {
  const response = await api.post<ApiResponse<ProjectNumber>>(
    `/projects/${projectId}/numbers`,
    payload,
    { headers: { "x-api-key": apiKey } },
  )
  return response.data
}

export const numberService = Object.freeze({ listByProject, create })

export type NumberService = typeof numberService
