import { memo, useCallback } from "react"
import { ImagePlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { ProjectNumber } from "@/features/projects/types"
import { MediaRequestStatusBadge } from "@/features/projects/components/numbers/MediaRequestStatusBadge"

interface NumberRowProps {
  item: ProjectNumber
  onSendMedia: (item: ProjectNumber) => void
}

const NumberRow = memo(function NumberRow({ item, onSendMedia }: NumberRowProps) {
  const handleClick = useCallback(() => onSendMedia(item), [item, onSendMedia])

  return (
    <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
      <td className="p-4 font-medium">{item.name}</td>
      <td className="p-4 tabular-nums">{item.number}</td>
      <td className="p-4 hidden sm:table-cell">
        <MediaRequestStatusBadge status={item.lastMediaRequestStatus} />
      </td>
      <td className="p-4 text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClick}
          title="Enviar foto para este contato"
          aria-label={`Enviar foto para ${item.name}`}
        >
          <ImagePlus className="size-4" />
          <span className="hidden sm:inline">Enviar foto</span>
        </Button>
      </td>
    </tr>
  )
})

interface NumbersTableProps {
  numbers: ProjectNumber[]
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onSendMedia: (item: ProjectNumber) => void
}

export function NumbersTable({
  numbers,
  page,
  totalPages,
  onPageChange,
  onSendMedia,
}: NumbersTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="border-b">
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nome</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground">Número</th>
              <th className="h-10 px-4 text-left font-medium text-muted-foreground hidden sm:table-cell min-w-36">
                Último envio
              </th>
              <th className="h-10 px-4 text-right font-medium text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {numbers.map((num) => (
              <NumberRow key={num.id} item={num} onSendMedia={onSendMedia} />
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
