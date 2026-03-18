import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"
import type { CreateProjectPayload } from "@/features/projects/types"

export function useCreateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateProjectPayload) => projectService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
    },
  })
}
