import { Phone } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MediaRequestImage } from "@/features/projects/components/numbers/MediaRequestImage"
import { MediaRequestStatusBadge } from "@/features/projects/components/numbers/MediaRequestStatusBadge"
import { formatDateBR } from "@/utils/formatDate"
import type { ProjectNumber } from "@/features/projects/types"
import { extractMediaRequestIdFromImageUrl } from "@/features/projects/utils/mediaRequestStatus"

interface MediaRequestPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  number: ProjectNumber | null
}

export function MediaRequestPreviewDialog({
  open,
  onOpenChange,
  projectId,
  number,
}: MediaRequestPreviewDialogProps) {
  if (!number) return null

  const mediaRequestId = extractMediaRequestIdFromImageUrl(number.imageUrl)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Mídia enviada</DialogTitle>
          <DialogDescription>
            Visualização da última mídia associada a este contato.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <Phone className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-1 flex-col">
              <span className="font-medium text-sm">{number.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {number.number}
              </span>
            </div>
            <MediaRequestStatusBadge status={number.lastMediaRequestStatus} />
          </div>

          <div className="flex items-center justify-center rounded-lg border bg-muted/20 p-2">
            <MediaRequestImage
              projectId={projectId}
              mediaRequestId={mediaRequestId}
              updatedAt={number.updatedAt}
              alt={`Mídia enviada para ${number.name}`}
              className="flex size-112 max-w-full items-center justify-center rounded-lg overflow-hidden"
              imgClassName="max-h-112 w-auto object-contain"
              enabled={open}
            />
          </div>

          {number.updatedAt && (
            <p className="text-xs text-muted-foreground text-center">
              Atualizado em {formatDateBR(number.updatedAt)}
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
