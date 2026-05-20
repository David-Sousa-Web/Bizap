import { memo, useCallback } from "react"
import { Eye, ImagePlus, MoreHorizontal, RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProjectNumber } from "@/features/projects/types"
import { getMediaRequestStatusActions } from "@/features/projects/utils/mediaRequestStatus"
import { usePermissions } from "@/features/access/hooks/usePermissions"

export interface NumberRowActionsMenuProps {
  number: ProjectNumber
  onSendMedia?: (item: ProjectNumber) => void
  onResendTemplate?: (item: ProjectNumber) => void
  onResendMedia?: (item: ProjectNumber) => void
  onViewMedia?: (item: ProjectNumber) => void
}

export const NumberRowActionsMenu = memo(function NumberRowActionsMenu({
  number,
  onSendMedia,
  onResendTemplate,
  onResendMedia,
  onViewMedia,
}: NumberRowActionsMenuProps) {
  const {
    canSendMedia,
    canResendTemplate,
    canSendMediaRequestMedia,
    canViewMediaRequestMedia,
  } = usePermissions()

  const statusActions = getMediaRequestStatusActions(
    number.lastMediaRequestStatus,
  )

  const showView =
    canViewMediaRequestMedia && number.imageUrl !== null && Boolean(onViewMedia)
  const showSend = canSendMedia && Boolean(onSendMedia)
  const showResendTemplate =
    canResendTemplate &&
    statusActions.canResendTemplate &&
    Boolean(onResendTemplate)
  const showResendMedia =
    canSendMediaRequestMedia &&
    statusActions.canResendMedia &&
    Boolean(onResendMedia)

  const hasAnyAction =
    showView || showSend || showResendTemplate || showResendMedia
  const hasMutations = showSend || showResendTemplate || showResendMedia

  const handleView = useCallback(() => onViewMedia?.(number), [number, onViewMedia])
  const handleSend = useCallback(() => onSendMedia?.(number), [number, onSendMedia])
  const handleResendTemplate = useCallback(
    () => onResendTemplate?.(number),
    [number, onResendTemplate],
  )
  const handleResendMedia = useCallback(
    () => onResendMedia?.(number),
    [number, onResendMedia],
  )

  if (!hasAnyAction) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Ações para ${number.name}`}
          title="Ações"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {showView && (
          <DropdownMenuItem onSelect={handleView}>
            <Eye className="size-4" />
            Visualizar mídia
          </DropdownMenuItem>
        )}

        {showView && hasMutations && <DropdownMenuSeparator />}

        {showSend && (
          <DropdownMenuItem onSelect={handleSend}>
            <ImagePlus className="size-4" />
            Enviar foto
          </DropdownMenuItem>
        )}

        {showResendTemplate && (
          <DropdownMenuItem onSelect={handleResendTemplate}>
            <RefreshCw className="size-4" />
            Reenviar template
          </DropdownMenuItem>
        )}

        {showResendMedia && (
          <DropdownMenuItem onSelect={handleResendMedia}>
            <Send className="size-4" />
            Reenviar mídia
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
})
