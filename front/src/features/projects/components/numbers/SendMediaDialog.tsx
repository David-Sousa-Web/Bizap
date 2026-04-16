import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  ImagePlus,
  Loader2,
  Send,
  Trash2,
  Upload,
  Info,
  Phone,
} from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import type { ProjectNumber } from "@/features/projects/types"
import { useSendMedia } from "@/features/projects/hooks/useSendMedia"

interface SendMediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  apiKey: string
  number: ProjectNumber | null
}

const ACCEPTED_MIME = ["image/jpeg", "image/png", "image/webp"] as const
const ACCEPT_ATTR = ACCEPTED_MIME.join(",")
const MAX_SIZE_BYTES = 5 * 1024 * 1024
const MAX_SIZE_LABEL = "5 MB"

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function SendMediaDialog({
  open,
  onOpenChange,
  projectId,
  apiKey,
  number,
}: SendMediaDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const sendMedia = useSendMedia()
  const isPending = sendMedia.isPending

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

  useEffect(() => {
    if (!open) {
      setFile(null)
      setIsDragging(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }, [open])

  const validateAndSet = useCallback((candidate: File | null) => {
    if (!candidate) return
    if (!ACCEPTED_MIME.includes(candidate.type as (typeof ACCEPTED_MIME)[number])) {
      toast.error("Formato inválido. Envie uma imagem JPG, PNG ou WebP.")
      return
    }
    if (candidate.size > MAX_SIZE_BYTES) {
      toast.error(`A imagem excede o limite de ${MAX_SIZE_LABEL}.`)
      return
    }
    setFile(candidate)
  }, [])

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const picked = event.target.files?.[0] ?? null
      validateAndSet(picked)
      event.target.value = ""
    },
    [validateAndSet],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      const dropped = event.dataTransfer.files?.[0] ?? null
      validateAndSet(dropped)
    },
    [validateAndSet],
  )

  const handleSend = useCallback(async () => {
    if (!file || !number) return
    try {
      await sendMedia.mutateAsync({
        projectId,
        bizapId: number.id,
        apiKey,
        file,
      })
      toast.success("Mídia enviada! O template foi disparado no WhatsApp.")
      onOpenChange(false)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message ?? "Falha ao enviar a mídia. Tente novamente.")
    }
  }, [apiKey, file, number, onOpenChange, projectId, sendMedia])

  if (!number) return null

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Enviar foto</DialogTitle>
          <DialogDescription>
            Envie uma imagem para este contato. O template do WhatsApp será disparado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3 rounded-lg border bg-muted/40 p-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-background ring-1 ring-border">
              <Phone className="size-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{number.name}</span>
              <span className="text-xs text-muted-foreground tabular-nums">
                {number.number}
              </span>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_ATTR}
            className="hidden"
            onChange={handleFileSelect}
          />

          {file && previewUrl ? (
            <div className="flex flex-col items-center gap-4 rounded-lg border bg-muted/20 p-4">
              <div className="relative size-40 overflow-hidden rounded-xl ring-2 ring-border">
                <img
                  src={previewUrl}
                  alt={file.name}
                  className="size-full object-cover"
                />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-sm font-medium truncate max-w-[20rem]">
                  {file.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatSize(file.size)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  disabled={isPending}
                >
                  <Upload className="size-4" />
                  Trocar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFile(null)}
                  disabled={isPending}
                >
                  <Trash2 className="size-4" />
                  Remover
                </Button>
              </div>
            </div>
          ) : (
            <div
              role="button"
              tabIndex={0}
              aria-label="Selecionar imagem"
              className={cn(
                "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-primary/50 hover:bg-accent/40",
              )}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault()
                  inputRef.current?.click()
                }
              }}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                <ImagePlus className="size-6 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Clique ou arraste uma imagem aqui
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG ou WebP. Máximo {MAX_SIZE_LABEL}.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-xs text-muted-foreground">
            <Info className="size-4 shrink-0 mt-0.5 text-amber-600" />
            <span>
              Esta ação dispara imediatamente o template do WhatsApp configurado no projeto para este contato.
            </span>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSend}
            disabled={!file || isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Enviar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
