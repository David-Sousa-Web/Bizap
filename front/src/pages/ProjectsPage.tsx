import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react"
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import { ProjectCard } from "@/features/projects/components/ProjectCard"
import { ProjectCardSkeleton } from "@/features/projects/components/ProjectCardSkeleton"
import { useProjects } from "@/features/projects/hooks/useProjects"
import { useDebounce } from "@/hooks/useDebounce"

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)

  const debouncedSearch = useDebounce(search)

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useProjects({
    page,
    limit,
    search: debouncedSearch || undefined,
  })

  const projects = response?.data ?? []
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
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
          <Button size="sm" onClick={() => navigate("/projetos/novo")}>
            <Plus className="size-4" />
            Novo Projeto
          </Button>
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar projetos..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ProjectCardSkeleton />
        </div>
      )}

      {isError && (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Erro ao carregar projetos</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a lista de projetos. Tente novamente mais
            tarde.
          </AlertDescription>
          <AlertAction>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw />
              Tentar novamente
            </Button>
          </AlertAction>
        </Alert>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderKanban />
            </EmptyMedia>
            <EmptyTitle>Nenhum projeto encontrado</EmptyTitle>
            <EmptyDescription>
              {debouncedSearch
                ? "Nenhum projeto corresponde à sua busca."
                : "Você ainda não possui projetos cadastrados."}
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {meta && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Página {meta.page} de {meta.totalPages} ({meta.total}{" "}
                {meta.total === 1 ? "projeto" : "projetos"})
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
                      <SelectItem value="6">6</SelectItem>
                      <SelectItem value="12">12</SelectItem>
                      <SelectItem value="24">24</SelectItem>
                      <SelectItem value="48">48</SelectItem>
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
