import { useState } from "react"
import { AlertCircle, ChevronLeft, ChevronRight, FileText, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { TemplateList } from "@/features/templates/components/TemplateList"
import { useTemplates } from "@/features/templates/hooks/useTemplates"
import { useDebounce } from "@/hooks/useDebounce"

function TemplatesTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Conteúdo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: 5 }).map((_, i) => (
          <TableRow key={i}>
            <TableCell>
              <Skeleton className="h-4 w-40" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16" />
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-20" />
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Skeleton className="h-4 w-64" />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function TemplatesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)

  const debouncedSearch = useDebounce(search)

  const { data: response, isLoading, isError } = useTemplates({
    page,
    limit,
    search: debouncedSearch || undefined,
  })

  const templates = response?.data ?? []
  const meta = response?.meta

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(1)
  }

  function handleLimitChange(value: string) {
    setLimit(Number(value))
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && <TemplatesTableSkeleton />}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Erro ao carregar templates</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a lista de templates. Tente novamente mais
            tarde.
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && templates.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>Nenhum template encontrado</EmptyTitle>
            <EmptyDescription>
              {debouncedSearch
                ? "Nenhum template corresponde à sua busca."
                : "Não há templates pré-aprovados disponíveis no momento."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !isError && templates.length > 0 && (
        <>
          <TemplateList templates={templates} />

          {meta && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Página {meta.page} de {meta.totalPages} ({meta.total}{" "}
                {meta.total === 1 ? "template" : "templates"})
              </p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm whitespace-nowrap">
                    Por página
                  </span>
                  <Select
                    value={String(limit)}
                    onValueChange={handleLimitChange}
                  >
                    <SelectTrigger size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                      <SelectItem value="100">100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {meta.totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={meta.page >= meta.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Próxima
                      <ChevronRight />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
