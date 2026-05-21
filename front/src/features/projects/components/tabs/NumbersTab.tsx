import { useCallback, useState, useEffect } from "react";
import {
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  Users,
  Search,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import type { Project, ProjectNumber } from "@/features/projects/types";
import { useProjectNumbers } from "@/features/projects/hooks/useProjectNumbers";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumbersTable } from "@/features/projects/components/numbers/NumbersTable";
import { AddNumberDialog } from "@/features/projects/components/numbers/AddNumberDialog";
import { SendMediaDialog } from "@/features/projects/components/numbers/SendMediaDialog";
import { ResendTemplateConfirmDialog } from "@/features/projects/components/numbers/ResendTemplateConfirmDialog";
import { ResendMediaConfirmDialog } from "@/features/projects/components/numbers/ResendMediaConfirmDialog";
import { MediaRequestPreviewDialog } from "@/features/projects/components/numbers/MediaRequestPreviewDialog";
import {
  NumbersFilters,
  type NumbersFiltersState,
} from "@/features/projects/components/numbers/NumbersFilters";
import { usePermissions } from "@/features/access/hooks/usePermissions";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";

interface NumbersTabProps {
  project: Project;
}

export function NumbersTab({ project }: NumbersTabProps) {
  const {
    canCreateNumbers,
    canSendMedia,
    canResendTemplate,
    canSendMediaRequestMedia,
    canViewMediaRequestMedia,
  } = usePermissions();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 500);

  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<NumbersFiltersState>({});

  // Reset page to 1 when search or limit changes
  useEffect(() => {
    setPage(1);
  }, [search, limit]);

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [mediaTarget, setMediaTarget] = useState<ProjectNumber | null>(null);
  const [resendTemplateTarget, setResendTemplateTarget] =
    useState<ProjectNumber | null>(null);
  const [resendMediaTarget, setResendMediaTarget] =
    useState<ProjectNumber | null>(null);
  const [previewTarget, setPreviewTarget] = useState<ProjectNumber | null>(
    null,
  );

  const handleSortChange = useCallback(
    (column: string) => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === "desc" ? "asc" : "desc"));
      } else {
        setSortBy(column);
        setSortOrder("asc");
      }
      setPage(1);
    },
    [sortBy],
  );

  const {
    data: response,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useProjectNumbers({
    projectId: project.id,
    page,
    limit,
    search: search || undefined,
    sortBy,
    sortOrder,
    lastMediaRequestStatus: filters.lastMediaRequestStatus,
    hasMedia:
      filters.hasMedia === "all"
        ? undefined
        : filters.hasMedia === "true"
          ? true
          : filters.hasMedia === "false"
            ? false
            : undefined,
    createdAtFrom: filters.createdAt?.from
      ? format(filters.createdAt.from, "yyyy-MM-dd")
      : undefined,
    createdAtTo: filters.createdAt?.to
      ? format(filters.createdAt.to, "yyyy-MM-dd")
      : undefined,
    updatedAtFrom: filters.updatedAt?.from
      ? format(filters.updatedAt.from, "yyyy-MM-dd")
      : undefined,
    updatedAtTo: filters.updatedAt?.to
      ? format(filters.updatedAt.to, "yyyy-MM-dd")
      : undefined,
  });

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const numbers: ProjectNumber[] = response?.data ?? [];
  const totalPages = response?.meta?.totalPages ?? 1;
  const total = response?.meta?.total ?? 0;

  const openAddDialog = useCallback(() => setIsAddOpen(true), []);
  const handleAddDialogChange = useCallback(
    (open: boolean) => setIsAddOpen(open),
    [],
  );

  const handleSendMedia = useCallback((target: ProjectNumber) => {
    setMediaTarget(target);
  }, []);

  const handleMediaDialogChange = useCallback((open: boolean) => {
    if (!open) setMediaTarget(null);
  }, []);

  const handleResendTemplate = useCallback((target: ProjectNumber) => {
    setResendTemplateTarget(target);
  }, []);

  const handleResendTemplateDialogChange = useCallback((open: boolean) => {
    if (!open) setResendTemplateTarget(null);
  }, []);

  const handleResendMedia = useCallback((target: ProjectNumber) => {
    setResendMediaTarget(target);
  }, []);

  const handleResendMediaDialogChange = useCallback((open: boolean) => {
    if (!open) setResendMediaTarget(null);
  }, []);

  const handleViewMedia = useCallback((target: ProjectNumber) => {
    setPreviewTarget(target);
  }, []);

  const handlePreviewDialogChange = useCallback((open: boolean) => {
    if (!open) setPreviewTarget(null);
  }, []);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1.5">
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5" />
              Números Associados
              {!isLoading && !isError && (
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  ({total} encontrado{total !== 1 ? "s" : ""})
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Contatos registrados neste projeto para atuar com a integração
              configurada.
            </CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start sm:self-auto w-full sm:w-auto">
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou número..."
                  className="pl-9 pr-8 h-9 w-full sm:w-[250px] lg:w-[300px]"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
                    title="Limpar busca"
                    type="button"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <NumbersFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  setFilters(newFilters);
                  setPage(1);
                }}
                onClearFilters={() => {
                  setFilters({});
                  setPage(1);
                }}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="h-9"
                onClick={handleRefresh}
                disabled={isLoading || isFetching}
                title="Atualizar lista"
                aria-label="Atualizar lista de números"
              >
                <RefreshCw
                  className={cn("size-4", isFetching && "animate-spin")}
                />
                {/* <span className="hidden sm:inline">Atualizar</span> */}
              </Button>
              {canCreateNumbers && (
                <Button size="sm" onClick={openAddDialog}>
                  <Plus className="size-4" />
                  <span className="hidden sm:inline">Adicionar número</span>
                  <span className="sm:hidden">Adicionar</span>
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              <span>Carregando números...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center p-12 text-destructive border border-destructive/20 border-dashed rounded-lg bg-destructive/5">
              <span>
                Erro ao carregar os números associados. Tente novamente mais
                tarde.
              </span>
            </div>
          ) : numbers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed text-muted-foreground">
              {search || Object.keys(filters).length > 0 ? (
                <>
                  <Search className="size-10 mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg">Nenhum resultado</h3>
                  <p className="text-sm mt-1 mb-4 max-w-sm">
                    Não encontramos contatos para os filtros aplicados. Tente
                    ajustar os critérios.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSearchInput("");
                      setFilters({});
                    }}
                  >
                    Limpar filtros
                  </Button>
                </>
              ) : (
                <>
                  <Phone className="size-10 mb-4 text-muted-foreground/50" />
                  <h3 className="font-medium text-lg">
                    Nenhum número registrado
                  </h3>
                  <p className="text-sm mt-1 mb-4 max-w-sm">
                    Ainda não há clientes ou colaboradores cadastrados para
                    interagir neste projeto.
                  </p>
                  {canCreateNumbers && (
                    <Button size="sm" onClick={openAddDialog}>
                      <Plus className="size-4" />
                      Adicionar primeiro número
                    </Button>
                  )}
                </>
              )}
            </div>
          ) : (
            <NumbersTable
              numbers={numbers}
              projectId={project.id}
              page={page}
              totalPages={totalPages}
              limit={limit}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onPageChange={setPage}
              onLimitChange={setLimit}
              onSortChange={handleSortChange}
              onSendMedia={canSendMedia ? handleSendMedia : undefined}
              onResendTemplate={
                canResendTemplate ? handleResendTemplate : undefined
              }
              onResendMedia={
                canSendMediaRequestMedia ? handleResendMedia : undefined
              }
              onViewMedia={
                canViewMediaRequestMedia ? handleViewMedia : undefined
              }
            />
          )}
        </CardContent>
      </Card>

      <AddNumberDialog
        open={isAddOpen}
        onOpenChange={handleAddDialogChange}
        projectId={project.id}
        apiKey={project.apiKey}
      />

      <SendMediaDialog
        open={!!mediaTarget}
        onOpenChange={handleMediaDialogChange}
        projectId={project.id}
        apiKey={project.apiKey}
        number={mediaTarget}
      />

      <ResendTemplateConfirmDialog
        open={!!resendTemplateTarget}
        onOpenChange={handleResendTemplateDialogChange}
        projectId={project.id}
        number={resendTemplateTarget}
      />

      <ResendMediaConfirmDialog
        open={!!resendMediaTarget}
        onOpenChange={handleResendMediaDialogChange}
        projectId={project.id}
        number={resendMediaTarget}
      />

      <MediaRequestPreviewDialog
        open={!!previewTarget}
        onOpenChange={handlePreviewDialogChange}
        projectId={project.id}
        number={previewTarget}
      />
    </div>
  );
}
