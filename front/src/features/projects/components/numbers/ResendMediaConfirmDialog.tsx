import { useCallback } from "react"
import { Loader2, Send } from "lucide-react"
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
import { useSendMediaRequestMedia } from "@/features/projects/hooks/useSendMediaRequestMedia"
import { extractMediaRequestIdFromImageUrl } from "@/features/projects/utils/mediaRequestStatus"
import type { ProjectNumber } from "@/features/projects/types"

interface ResendMediaConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  number: ProjectNumber | null
}

export function ResendMediaConfirmDialog({
  open,
  onOpenChange,
  projectId,
  number,
}: ResendMediaConfirmDialogProps) {
  const sendMedia = useSendMediaRequestMedia()
  const isPending = sendMedia.isPending

  const handleConfirm = useCallback(async () => {
    if (!number) return
    const mediaRequestId = extractMediaRequestIdFromImageUrl(number.imageUrl)
    if (!mediaRequestId) {
      toast.error("Não foi possível identificar a solicitação de mídia.")
      onOpenChange(false)
      return
    }

    try {
      const result = await sendMedia.mutateAsync({ projectId, mediaRequestId })
      toast.success(result.message ?? "Mídia enviada com sucesso.")
      onOpenChange(false)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message ?? "Falha ao enviar a mídia. Tente novamente.")
    }
  }, [number, onOpenChange, projectId, sendMedia])

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
          <AlertDialogTitle>Reenviar mídia agora?</AlertDialogTitle>
          <AlertDialogDescription>
            A mensagem do fluxo e a mídia serão enviadas via WhatsApp para{" "}
            <strong className="text-foreground">{number.name}</strong>{" "}
            (<span className="tabular-nums">{number.number}</span>). Esta ação
            dispara um novo envio pelo Twilio e pode gerar custos.
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
              <Send className="size-4" />
            )}
            Reenviar mídia
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
