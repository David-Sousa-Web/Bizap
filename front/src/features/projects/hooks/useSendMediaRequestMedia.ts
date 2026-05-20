import { useMutation, useQueryClient } from "@tanstack/react-query"
import { mediaService } from "@/services/mediaService"

interface SendMediaRequestMediaParams {
  projectId: string
  mediaRequestId: string
}

export function useSendMediaRequestMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ projectId, mediaRequestId }: SendMediaRequestMediaParams) =>
      mediaService.sendMediaRequestMedia(projectId, mediaRequestId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["project-numbers", variables.projectId],
      })
    },
  })
}
