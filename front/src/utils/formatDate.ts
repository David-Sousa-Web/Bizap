import { format, formatDistanceToNow, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"

function safeParse(value: string | Date | null | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : parseISO(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

export function formatDateBR(value: string | Date | null | undefined): string {
  const date = safeParse(value)
  if (!date) return "—"
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
}

export function formatRelativeDate(
  value: string | Date | null | undefined,
): string {
  const date = safeParse(value)
  if (!date) return "—"
  return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
}
