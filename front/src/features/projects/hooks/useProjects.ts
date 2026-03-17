import { useQuery, keepPreviousData } from "@tanstack/react-query"
import type { PaginationParams } from "@/types/api"
import { projectService } from "@/services/projectService"

export function useProjects(params?: PaginationParams) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => projectService.list(params),
    placeholderData: keepPreviousData,
  })
}
