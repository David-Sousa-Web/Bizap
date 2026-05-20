import { useCallback } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import axios from "axios"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useResendTemplate } from "@/features/projects/hooks/useResendTemplate"
import { extractMediaRequestIdFromImageUrl } from "@/features/projects/utils/mediaRequestStatus"
import type { ProjectNumber } from "@/features/projects/types"

interface ResendTemplateConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  number: ProjectNumber | null
}

export function ResendTemplateConfirmDialog({
  open,
  onOpenChange,
  projectId,
  number,
}: ResendTemplateConfirmDialogProps) {
  const resend = useResendTemplate()
  const isPending = resend.isPending

  const handleConfirm = useCallback(async () => {
    if (!number) return
    const mediaRequestId = extractMediaRequestIdFromImageUrl(number.imageUrl)
    if (!mediaRequestId) {
      toast.error("Não foi possível identificar a solicitação de mídia.")
      onOpenChange(false)
      return
    }

    try {
      const result = await resend.mutateAsync({ projectId, mediaRequestId })
      toast.success(result.message ?? "Template reenviado com sucesso.")
      onOpenChange(false)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message ?? "Falha ao reenviar o template. Tente novamente.")
    }
  }, [number, onOpenChange, projectId, resend])

  if (!number) return null

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (isPending) return
        onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reenviar template?</AlertDialogTitle>
          <AlertDialogDescription>
            O template do WhatsApp será disparado novamente para{" "}
            <strong className="text-foreground">{number.name}</strong>{" "}
            (<span className="tabular-nums">{number.number}</span>). Esta ação só
            está disponível para envios que falharam.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={isPending}>
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Reenviar template
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
