import { memo, useCallback } from "react"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type { ProjectNumber } from "@/features/projects/types"
import { MediaRequestStatusBadge } from "@/features/projects/components/numbers/MediaRequestStatusBadge"
import { MediaRequestImage } from "@/features/projects/components/numbers/MediaRequestImage"
import {
  NumberRowActionsMenu,
  type NumberRowActionsMenuProps,
} from "@/features/projects/components/numbers/NumberRowActionsMenu"
import { extractMediaRequestIdFromImageUrl } from "@/features/projects/utils/mediaRequestStatus"
import { formatDateBR, formatRelativeDate } from "@/utils/formatDate"

interface NumberRowProps
  extends Omit<NumberRowActionsMenuProps, "number"> {
  item: ProjectNumber
  projectId: string
}

const NumberRow = memo(function NumberRow({
  item,
  projectId,
  onSendMedia,
  onResendTemplate,
  onResendMedia,
  onViewMedia,
}: NumberRowProps) {
  const mediaRequestId = extractMediaRequestIdFromImageUrl(item.imageUrl)
  const hasMedia = item.imageUrl !== null && mediaRequestId !== null

  const handleThumbnailClick = useCallback(() => {
    if (hasMedia) onViewMedia?.(item)
  }, [hasMedia, item, onViewMedia])

  return (
    <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
      <td className="p-3 w-[64px]">
        {hasMedia ? (
          <button
            type="button"
            onClick={handleThumbnailClick}
            className="block size-12 overflow-hidden rounded-md ring-1 ring-border transition hover:ring-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            title={`Ver mídia de ${item.name}`}
            aria-label={`Visualizar mídia de ${item.name}`}
          >
            <MediaRequestImage
              projectId={projectId}
              mediaRequestId={mediaRequestId}
              updatedAt={item.updatedAt}
              alt={`Mídia de ${item.name}`}
              className="flex size-full items-center justify-center"
              imgClassName="size-full object-cover"
            />
          </button>
        ) : (
          <MediaRequestImage
            projectId={projectId}
            mediaRequestId={null}
            updatedAt={null}
            alt="Sem mídia"
            className="flex size-12 items-center justify-center rounded-md ring-1 ring-border"
          />
        )}
      </td>
      <td className="p-4 font-medium">{item.name}</td>
      <td className="p-4 tabular-nums">{item.number}</td>
      <td className="p-4 hidden sm:table-cell">
        <MediaRequestStatusBadge status={item.lastMediaRequestStatus} />
      </td>
      <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">
        {item.updatedAt ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                {formatRelativeDate(item.updatedAt)}
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              {formatDateBR(item.updatedAt)}
            </TooltipContent>
          </Tooltip>
        ) : (
          <span>—</span>
        )}
      </td>
      <td className="p-4 text-right">
        <NumberRowActionsMenu
          number={item}
          onSendMedia={onSendMedia}
          onResendTemplate={onResendTemplate}
          onResendMedia={onResendMedia}
          onViewMedia={onViewMedia}
        />
      </td>
    </tr>
  )
})

interface NumbersTableProps {
  numbers: ProjectNumber[]
  projectId: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onSendMedia?: (item: ProjectNumber) => void
  onResendTemplate?: (item: ProjectNumber) => void
  onResendMedia?: (item: ProjectNumber) => void
  onViewMedia?: (item: ProjectNumber) => void
}

export function NumbersTable({
  numbers,
  projectId,
  page,
  totalPages,
  onPageChange,
  onSendMedia,
  onResendTemplate,
  onResendMedia,
  onViewMedia,
}: NumbersTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="border-b">
              <th className="h-10 px-3 text-left font-medium text-muted-foreground w-[64px]">
                Foto
              </th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nome</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Número</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden sm:table-cell min-w-36">
                Último envio
              </th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden md:table-cell min-w-36">
                Atualizado
              </th>
              <th className="h-10 px-4 text-right font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {numbers.map((num) => (
              <NumberRow
                key={num.id}
                item={num}
                projectId={projectId}
                onSendMedia={onSendMedia}
                onResendTemplate={onResendTemplate}
                onResendMedia={onResendMedia}
                onViewMedia={onViewMedia}
              />
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border/50 pt-4 px-1">
          <div className="text-sm text-muted-foreground">
            Página <span className="font-medium">{page}</span> de{" "}
            <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
