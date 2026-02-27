import { useQuery, keepPreviousData } from "@tanstack/react-query"
import type { PaginationParams } from "@/types/api"
import { templateService } from "@/services/templateService"

export function useTemplates(params?: PaginationParams) {
  return useQuery({
    queryKey: ["templates", params],
    queryFn: () => templateService.list(params),
    placeholderData: keepPreviousData,
  })
}
