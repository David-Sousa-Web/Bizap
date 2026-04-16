import { api } from "@/lib/api"
import type { ApiResponse } from "@/types/api"
import type { MediaRequest } from "@/features/projects/types"

async function send(
  projectId: string,
  bizapId: string,
  apiKey: string,
  file: File,
): Promise<ApiResponse<MediaRequest>> {
  const formData = new FormData()
  formData.append("file", file)
  const response = await api.post<ApiResponse<MediaRequest>>(
    `/projects/${projectId}/${bizapId}/media`,
    formData,
    {
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "multipart/form-data",
      },
    },
  )
  return response.data
}

export const mediaService = Object.freeze({ send })

export type MediaService = typeof mediaService
