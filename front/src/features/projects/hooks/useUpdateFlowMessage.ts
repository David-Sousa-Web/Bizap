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
      // Atualiza o cache do projeto específico
      queryClient.setQueryData(["projects", variables.id], response)
      
      // Invalida a listagem geral para refletir a mudança
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}
