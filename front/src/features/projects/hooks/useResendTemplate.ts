import { useMutation, useQueryClient } from "@tanstack/react-query"
import { mediaService } from "@/services/mediaService"

interface ResendTemplateParams {
  projectId: string
  mediaRequestId: string
}

export function useResendTemplate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, mediaRequestId }: ResendTemplateParams) =>
      mediaService.resendTemplate(projectId, mediaRequestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-numbers", variables.projectId],
      })
    },
  })
}
