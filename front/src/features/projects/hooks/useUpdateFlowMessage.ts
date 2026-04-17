import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"
import type { UpdateFlowMessagePayload } from "../types"

export function useUpdateFlowMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string
      data: UpdateFlowMessagePayload
    }) => projectService.updateFlowMessage(id, data),
    onSuccess: (response, variables) => {
      queryClient.setQueryData(["project", variables.id], response)
      queryClient.invalidateQueries({ queryKey: ["project", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}
