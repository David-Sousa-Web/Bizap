import { useMutation, useQueryClient } from "@tanstack/react-query"
import { numberService } from "@/services/numberService"
import type { CreateNumberPayload } from "@/features/projects/types"

interface CreateNumberParams {
  projectId: string
  apiKey: string
  payload: CreateNumberPayload
}

export function useCreateNumber() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, apiKey, payload }: CreateNumberParams) =>
      numberService.create(projectId, apiKey, payload),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["project-numbers", projectId] })
    },
  })
}
