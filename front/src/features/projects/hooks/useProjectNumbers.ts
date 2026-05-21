import { useQuery } from "@tanstack/react-query"
import { numberService } from "@/services/numberService"
import type { ListNumbersParams } from "@/types/api"

interface UseProjectNumbersOptions extends ListNumbersParams {
  projectId: string | undefined
}

export function useProjectNumbers({
  projectId,
  ...params
}: UseProjectNumbersOptions) {
  return useQuery({
    queryKey: [
      "project-numbers",
      projectId,
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder,
      params.lastMediaRequestStatus,
      params.hasMedia,
      params.createdAtFrom,
      params.createdAtTo,
      params.updatedAtFrom,
      params.updatedAtTo,
    ],
    queryFn: () => {
      if (!projectId) throw new Error("Project ID is required")
      return numberService.listByProject(projectId, params)
    },
    enabled: !!projectId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
  })
}
