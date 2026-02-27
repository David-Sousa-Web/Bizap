import { api } from "@/lib/api"
import type { PaginatedApiResponse, PaginationParams } from "@/types/api"
import type { Template } from "@/features/templates/types"

async function list(
  params?: PaginationParams,
): Promise<PaginatedApiResponse<Template[]>> {
  const response = await api.get<PaginatedApiResponse<Template[]>>(
    "/templates",
    { params },
  )
  return response.data
}

export const templateService = Object.freeze({ list })

export type TemplateService = typeof templateService
