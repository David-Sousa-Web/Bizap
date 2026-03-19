import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"
import type { UpdateProjectPayload } from "@/features/projects/types"

interface UseUpdateProjectOptions {
  id: string
  data: UpdateProjectPayload
}

export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UseUpdateProjectOptions) =>
      projectService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", id] })
    },
  })
}
