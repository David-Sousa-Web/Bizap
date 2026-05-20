import { useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { mediaService } from "@/services/mediaService"

interface UseMediaRequestImageOptions {
  projectId: string | undefined
  mediaRequestId: string | null | undefined
  updatedAt: string | null | undefined
  enabled?: boolean
}

interface UseMediaRequestImageResult {
  objectUrl: string | undefined
  isLoading: boolean
  isError: boolean
}

export function useMediaRequestImage({
  projectId,
  mediaRequestId,
  updatedAt,
  enabled = true,
}: UseMediaRequestImageOptions): UseMediaRequestImageResult {
  const isReady = enabled && Boolean(projectId) && Boolean(mediaRequestId)

  const { data, isLoading, isError } = useQuery({
    queryKey: ["media-request-image", projectId, mediaRequestId, updatedAt],
    queryFn: async () => {
      if (!projectId || !mediaRequestId) {
        throw new Error("projectId and mediaRequestId are required")
      }
      const { blob } = await mediaService.fetchMediaBlob(projectId, mediaRequestId)
      return URL.createObjectURL(blob)
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!data) return
    return () => {
      URL.revokeObjectURL(data)
    }
  }, [data])

  return {
    objectUrl: data,
    isLoading: isReady && isLoading,
    isError,
  }
}
