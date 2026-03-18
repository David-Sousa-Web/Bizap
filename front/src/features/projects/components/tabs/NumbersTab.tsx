import { useState } from "react"
import { Users, Phone, Loader2 } from "lucide-react"
import type { ProjectNumber } from "@/features/projects/types"
import { useProjectNumbers } from "@/features/projects/hooks/useProjectNumbers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface NumbersTabProps {
  projectId: string
}

export function NumbersTab({ projectId }: NumbersTabProps) {
  const [page, setPage] = useState(1)
  const limit = 10

  const { data: response, isLoading, isError } = useProjectNumbers({
    projectId,
    page,
    limit,
  })

  // Destructure pagination and data
  const numbers: ProjectNumber[] = response?.data ?? []
  const totalPages = response?.meta?.totalPages ?? 1
  const total = response?.meta?.total ?? 0

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card>
        <CardHeader>
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
              <p className="text-sm mt-1 max-w-sm">
                Ainda não há clientes ou colaboradores cadastrados para interagir neste projeto.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="border-b">
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Nome</th>
                      <th className="h-10 px-4 text-left font-medium text-muted-foreground">Número</th>
                    </tr>
                  </thead>
                  <tbody>
                    {numbers.map((num) => (
                      <tr key={num.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                        <td className="p-4 font-medium">{num.name}</td>
                        <td className="p-4 tabular-nums">{num.number}</td>
                      </tr>
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
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
