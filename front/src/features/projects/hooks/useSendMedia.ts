import { useMutation } from "@tanstack/react-query"
import { mediaService } from "@/services/mediaService"

interface SendMediaParams {
  projectId: string
  bizapId: string
  apiKey: string
  file: File
}

export function useSendMedia() {
  return useMutation({
    mutationFn: ({ projectId, bizapId, apiKey, file }: SendMediaParams) =>
      mediaService.send(projectId, bizapId, apiKey, file),
  })
}
