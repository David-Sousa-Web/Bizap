import { useMutation, useQueryClient } from "@tanstack/react-query"
import { projectService } from "@/services/projectService"

interface UploadProjectImageParams {
  projectId: string
  file: File
}

export function useUploadProjectImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, file }: UploadProjectImageParams) =>
      projectService.uploadImage(projectId, file),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      queryClient.invalidateQueries({ queryKey: ["project", projectId] })
    },
  })
}
