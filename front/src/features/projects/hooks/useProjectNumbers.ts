import { useQuery } from "@tanstack/react-query"
import { numberService } from "@/services/numberService"
import type { PaginationParams } from "@/types/api"

interface UseProjectNumbersOptions extends PaginationParams {
  projectId: string | undefined
}

export function useProjectNumbers({
  projectId,
  page,
  limit,
  search,
}: UseProjectNumbersOptions) {
  return useQuery({
    queryKey: ["project-numbers", projectId, page, limit, search],
    queryFn: () => {
      if (!projectId) throw new Error("Project ID is required")
      return numberService.listByProject(projectId, { page, limit, search })
    },
    enabled: !!projectId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })
}
