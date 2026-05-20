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

async function resendTemplate(
  projectId: string,
  mediaRequestId: string,
): Promise<ApiResponse<MediaRequest>> {
  const response = await api.post<ApiResponse<MediaRequest>>(
    `/projects/${projectId}/media-requests/${mediaRequestId}/template/resend`,
  )
  return response.data
}

async function sendMediaRequestMedia(
  projectId: string,
  mediaRequestId: string,
): Promise<ApiResponse<MediaRequest>> {
  const response = await api.post<ApiResponse<MediaRequest>>(
    `/projects/${projectId}/media-requests/${mediaRequestId}/media/send`,
  )
  return response.data
}

interface MediaBlobResult {
  blob: Blob
  contentType: string | null
}

async function fetchMediaBlob(
  projectId: string,
  mediaRequestId: string,
): Promise<MediaBlobResult> {
  const response = await api.get<Blob>(
    `/projects/${projectId}/media-requests/${mediaRequestId}/media`,
    { responseType: "blob" },
  )
  const contentType =
    (response.headers["content-type"] as string | undefined) ?? null
  return { blob: response.data, contentType }
}

export const mediaService = Object.freeze({
  send,
  resendTemplate,
  sendMediaRequestMedia,
  fetchMediaBlob,
})

export type MediaService = typeof mediaService
