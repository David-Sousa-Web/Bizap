import { useQuery } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ["project", id],
    queryFn: () => {
      if (!id) throw new Error("Project ID is required")
      return projectService.getById(id)
    },
    enabled: !!id,
  })
}
