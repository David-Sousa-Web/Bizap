import {
  AlertTriangle,
  CheckCheck,
  CheckCircle2,
  Clock,
  Inbox,
  RefreshCw,
  Send,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import type { MediaRequestStatus } from "@/features/projects/types"

export interface MediaStatusDisplay {
  label: string
  description: string
  icon: LucideIcon
  tone: string
}

export const mediaRequestStatusMap: Record<MediaRequestStatus, MediaStatusDisplay> = {
  PENDING: {
    label: "Pendente",
    description: "Registro criado. Template ainda não disparado.",
    icon: Clock,
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  TEMPLATE_SENT: {
    label: "Template enviado",
    description: "Template do WhatsApp enviado. Aguardando resposta do cliente.",
    icon: Send,
    tone: "border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-400",
  },
  RECONFIRMATION_SENT: {
    label: "Reconfirmação",
    description: "Cliente respondeu algo inválido. Solicitada uma nova confirmação.",
    icon: RefreshCw,
    tone: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  CONFIRMED: {
    label: "Confirmado",
    description: "Cliente confirmou. Aguardando o envio da mídia.",
    icon: CheckCircle2,
    tone: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  MEDIA_SENT: {
    label: "Mídia recebida",
    description: "Fluxo concluído. Mídia recebida do cliente.",
    icon: CheckCheck,
    tone: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  },
  DECLINED: {
    label: "Recusado",
    description: "Cliente recusou o envio.",
    icon: XCircle,
    tone: "border-zinc-500/30 bg-zinc-500/10 text-zinc-700 dark:text-zinc-400",
  },
  INVALID_RESPONSE_LIMIT: {
    label: "Limite atingido",
    description: "Cliente excedeu o limite de respostas inválidas.",
    icon: AlertTriangle,
    tone: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  TEMPLATE_SEND_FAILED: {
    label: "Falha no template",
    description: "Não foi possível enviar o template do WhatsApp.",
    icon: AlertTriangle,
    tone: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  MEDIA_SEND_FAILED: {
    label: "Falha no envio da mídia",
    description: "Não foi possível enviar a mídia confirmada ao cliente.",
    icon: AlertTriangle,
    tone: "border-red-600/30 bg-red-600/10 text-red-700 dark:text-red-400",
  },
  FAILED: {
    label: "Falhou",
    description: "Falha ao disparar o template ou processar a mídia.",
    icon: AlertTriangle,
    tone: "border-destructive/30 bg-destructive/10 text-destructive",
  },
}

export const EMPTY_STATUS_DISPLAY: MediaStatusDisplay = {
  label: "Sem envios",
  description: "Nenhuma mídia foi solicitada para este contato.",
  icon: Inbox,
  tone: "border-border text-muted-foreground bg-muted/40",
}

const UNKNOWN_STATUS_DISPLAY: MediaStatusDisplay = {
  label: "Status desconhecido",
  description: "Status não reconhecido pela interface. Atualize o sistema.",
  icon: AlertTriangle,
  tone: "border-muted-foreground/30 bg-muted text-muted-foreground",
}

export function getMediaRequestStatusDisplay(
  status: MediaRequestStatus | null,
): MediaStatusDisplay {
  if (!status) return EMPTY_STATUS_DISPLAY
  return mediaRequestStatusMap[status] ?? UNKNOWN_STATUS_DISPLAY
}
