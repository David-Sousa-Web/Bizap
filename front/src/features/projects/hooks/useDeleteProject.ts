import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"

export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => projectService.remove(id),
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.removeQueries({ queryKey: ["project", deletedId] })
    },
  })
}
