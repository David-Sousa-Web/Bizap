import { memo, useCallback } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import type { ProjectNumber } from "@/features/projects/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MediaRequestStatusBadge } from "@/features/projects/components/numbers/MediaRequestStatusBadge";
import { MediaRequestImage } from "@/features/projects/components/numbers/MediaRequestImage";
import {
  NumberRowActionsMenu,
  type NumberRowActionsMenuProps,
} from "@/features/projects/components/numbers/NumberRowActionsMenu";
import { extractMediaRequestIdFromImageUrl } from "@/features/projects/utils/mediaRequestStatus";
import { formatDateBR } from "@/utils/formatDate";

interface NumberRowProps extends Omit<NumberRowActionsMenuProps, "number"> {
  item: ProjectNumber;
  projectId: string;
}

const NumberRow = memo(function NumberRow({
  item,
  projectId,
  onSendMedia,
  onResendTemplate,
  onResendMedia,
  onViewMedia,
}: NumberRowProps) {
  const mediaRequestId = extractMediaRequestIdFromImageUrl(item.imageUrl);
  const hasMedia = item.imageUrl !== null && mediaRequestId !== null;

  const handleThumbnailClick = useCallback(() => {
    if (hasMedia) onViewMedia?.(item);
  }, [hasMedia, item, onViewMedia]);

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
        {item.updatedAt ? formatDateBR(item.updatedAt) : "—"}
      </td>
      <td className="p-4 hidden md:table-cell text-muted-foreground text-xs">
        {item.createdAt ? formatDateBR(item.createdAt) : "—"}
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
  );
});

interface NumbersTableProps {
  numbers: ProjectNumber[];
  projectId: string;
  page: number;
  totalPages: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onSortChange?: (column: string) => void;
  onSendMedia?: (item: ProjectNumber) => void;
  onResendTemplate?: (item: ProjectNumber) => void;
  onResendMedia?: (item: ProjectNumber) => void;
  onViewMedia?: (item: ProjectNumber) => void;
}

function SortableHeader({
  label,
  column,
  sortBy,
  sortOrder,
  onSortChange,
  className,
}: {
  label: string;
  column: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange?: (col: string) => void;
  className?: string;
}) {
  const isSorted = sortBy === column;
  return (
    <th
      className={cn(
        "h-10 px-4 text-left font-medium text-muted-foreground",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => onSortChange?.(column)}
        className="flex items-center gap-1 hover:text-foreground transition-colors group"
      >
        {label}
        {isSorted ? (
          sortOrder === "desc" ? (
            <ArrowDown className="size-3.5" />
          ) : (
            <ArrowUp className="size-3.5" />
          )
        ) : (
          <ArrowUpDown className="size-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
        )}
      </button>
    </th>
  );
}

export function NumbersTable({
  numbers,
  projectId,
  page,
  totalPages,
  limit = 10,
  sortBy,
  sortOrder,
  onPageChange,
  onLimitChange,
  onSortChange,
  onSendMedia,
  onResendTemplate,
  onResendMedia,
  onViewMedia,
}: NumbersTableProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-md border overflow-hidden">
        <div className="max-h-[60dvh] overflow-y-auto">
          <table className="w-full text-sm relative">
            <thead className="bg-muted sticky top-0 z-10 shadow-sm">
              <tr className="border-b">
                <th className="h-10 px-3 text-left font-medium text-muted-foreground w-[64px]">
                  Foto
                </th>
                <SortableHeader
                  label="Nome"
                  column="name"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={onSortChange}
                />
                <SortableHeader
                  label="Número"
                  column="number"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={onSortChange}
                />
                <SortableHeader
                  label="Último envio"
                  column="lastMediaRequestStatus"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={onSortChange}
                  className="hidden sm:table-cell min-w-36"
                />
                <SortableHeader
                  label="Atualizado"
                  column="updatedAt"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={onSortChange}
                  className="hidden md:table-cell min-w-36"
                />
                <SortableHeader
                  label="Criado em"
                  column="createdAt"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={onSortChange}
                  className="hidden md:table-cell min-w-36"
                />
                <th className="h-10 px-4 text-right font-medium text-muted-foreground">
                  Ações
                </th>
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
      </div>

      {totalPages > 1 || (onLimitChange && numbers.length > 0) ? (
        <div className="flex items-center justify-between border-t border-border/50 pt-4 px-1 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Página <span className="font-medium">{page}</span> de{" "}
              <span className="font-medium">{totalPages}</span>
            </div>

            {onLimitChange && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Por página:
                </span>
                <Select
                  value={limit.toString()}
                  onValueChange={(val) => onLimitChange(Number(val))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={limit.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={page === 1}
              className="hidden sm:flex"
              title="Primeira página"
            >
              <ChevronsLeft className="size-4" />
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={page >= totalPages}
              className="hidden sm:flex"
              title="Última página"
            >
              <ChevronsRight className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
