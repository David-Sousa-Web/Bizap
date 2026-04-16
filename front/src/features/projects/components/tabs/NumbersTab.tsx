import { useCallback, useState } from "react"
import { Loader2, Phone, Plus, Users } from "lucide-react"

import type { Project, ProjectNumber } from "@/features/projects/types"
import { useProjectNumbers } from "@/features/projects/hooks/useProjectNumbers"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NumbersTable } from "@/features/projects/components/numbers/NumbersTable"
import { AddNumberDialog } from "@/features/projects/components/numbers/AddNumberDialog"
import { SendMediaDialog } from "@/features/projects/components/numbers/SendMediaDialog"

interface NumbersTabProps {
  project: Project
}

export function NumbersTab({ project }: NumbersTabProps) {
  const [page, setPage] = useState(1)
  const limit = 10

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [mediaTarget, setMediaTarget] = useState<ProjectNumber | null>(null)

  const { data: response, isLoading, isError } = useProjectNumbers({
    projectId: project.id,
    page,
    limit,
  })

  const numbers: ProjectNumber[] = response?.data ?? []
  const totalPages = response?.meta?.totalPages ?? 1
  const total = response?.meta?.total ?? 0

  const openAddDialog = useCallback(() => setIsAddOpen(true), [])
  const handleAddDialogChange = useCallback((open: boolean) => setIsAddOpen(open), [])

  const handleSendMedia = useCallback((target: ProjectNumber) => {
    setMediaTarget(target)
  }, [])

  const handleMediaDialogChange = useCallback((open: boolean) => {
    if (!open) setMediaTarget(null)
  }, [])

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
              Contatos registrados neste projeto para atuar com a integração configurada.
            </CardDescription>
          </div>

          <Button size="sm" onClick={openAddDialog} className="self-start sm:self-auto">
            <Plus className="size-4" />
            Adicionar número
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="size-6 animate-spin mr-2" />
              <span>Carregando números...</span>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center p-12 text-destructive border border-destructive/20 border-dashed rounded-lg bg-destructive/5">
              <span>Erro ao carregar os números associados. Tente novamente mais tarde.</span>
            </div>
          ) : numbers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-lg border border-dashed text-muted-foreground">
              <Phone className="size-10 mb-4 text-muted-foreground/50" />
              <h3 className="font-medium text-lg">Nenhum número registrado</h3>
              <p className="text-sm mt-1 mb-4 max-w-sm">
                Ainda não há clientes ou colaboradores cadastrados para interagir neste projeto.
              </p>
              <Button size="sm" onClick={openAddDialog}>
                <Plus className="size-4" />
                Adicionar primeiro número
              </Button>
            </div>
          ) : (
            <NumbersTable
              numbers={numbers}
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              onSendMedia={handleSendMedia}
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
    </div>
  )
}
