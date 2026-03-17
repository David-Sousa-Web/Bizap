import { api } from "@/lib/api"
import type { PaginatedApiResponse, PaginationParams } from "@/types/api"
import type { Project } from "@/features/projects/types"

async function list(
  params?: PaginationParams,
): Promise<PaginatedApiResponse<Project[]>> {
  const response = await api.get<PaginatedApiResponse<Project[]>>(
    "/projects",
    { params },
  )
  return response.data
}

export const projectService = Object.freeze({ list })

export type ProjectService = typeof projectService
