import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { useMediaRequestImage } from "@/features/projects/hooks/useMediaRequestImage"

interface MediaRequestImageProps {
  projectId: string
  mediaRequestId: string | null
  updatedAt: string | null
  alt: string
  className?: string
  imgClassName?: string
  enabled?: boolean
}

export function MediaRequestImage({
  projectId,
  mediaRequestId,
  updatedAt,
  alt,
  className,
  imgClassName,
  enabled = true,
}: MediaRequestImageProps) {
  const { objectUrl, isLoading, isError } = useMediaRequestImage({
    projectId,
    mediaRequestId,
    updatedAt,
    enabled,
  })

  if (!mediaRequestId) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground/60",
          className,
        )}
        aria-label="Sem mídia disponível"
      >
        <ImageOff className="size-4" aria-hidden="true" />
      </div>
    )
  }

  if (isLoading) {
    return <Skeleton className={cn("bg-muted", className)} />
  }

  if (isError || !objectUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground",
          className,
        )}
        aria-label="Falha ao carregar mídia"
        title="Falha ao carregar mídia"
      >
        <ImageOff className="size-4" aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={objectUrl}
      alt={alt}
      loading="lazy"
      className={cn("object-cover", imgClassName)}
    />
  )
}
