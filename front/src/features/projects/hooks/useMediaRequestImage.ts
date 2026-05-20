import { useEffect, useState } from "react"
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

  const { data: blob, isLoading, isError } = useQuery({
    queryKey: ["media-request-image", projectId, mediaRequestId, updatedAt],
    queryFn: async () => {
      if (!projectId || !mediaRequestId) {
        throw new Error("projectId and mediaRequestId are required")
      }
      const { blob } = await mediaService.fetchMediaBlob(projectId, mediaRequestId)
      return blob
    },
    enabled: isReady,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60,
    retry: 1,
    refetchOnWindowFocus: false,
  })

  const [objectUrl, setObjectUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    if (!blob) {
      setObjectUrl(undefined)
      return
    }
    const url = URL.createObjectURL(blob)
    setObjectUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  }, [blob])

  return {
    objectUrl,
    isLoading: isReady && isLoading,
    isError,
  }
}
