import { Copy, KeyRound, AlertTriangle, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useDeleteProject } from "@/features/projects/hooks/useDeleteProject"
import type { Project } from "@/features/projects/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface AdvancedTabProps {
  project: Project
}

export function AdvancedTab({ project }: AdvancedTabProps) {
  const navigate = useNavigate()
  const deleteProject = useDeleteProject()

  function handleCopyApiKey() {
    navigator.clipboard.writeText(project.apiKey)
      .then(() => toast.success("API Key copiada para a área de transferência!"))
      .catch(() => toast.error("Falha ao copiar a API Key."))
  }

  async function handleDelete() {
    try {
      await deleteProject.mutateAsync(project.id)
      toast.success("Projeto excluído com sucesso.")
      navigate("/projetos", { replace: true })
    } catch {
      toast.error("Ocorreu um erro ao excluir o projeto. Tente novamente.")
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Credenciais de API
          </CardTitle>
          <CardDescription>
            Use a API Key abaixo para integrar sua aplicação externa (ex: disparo via backend do cliente)
            com este projeto no formato de Autenticação Bearer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2 max-w-xl">
            <Label htmlFor="apiKey">API Key (Token de Acesso)</Label>
            <div className="flex w-full items-center gap-2">
              <Input
                id="apiKey"
                readOnly
                value={project.apiKey}
                className="font-mono text-sm"
              />
              <Button type="button" variant="outline" size="icon" onClick={handleCopyApiKey} title="Copiar API Key">
                <Copy className="size-4" />
                <span className="sr-only">Copiar</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="size-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis que mudarão permanentemente o estado deste projeto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm font-medium mb-4">
            Ao excluir este projeto, você perderá a API Key e as configurações atreladas.
            Todas interações no chat pararão de funcionar para este escopo instantaneamente.
          </p>
        </CardContent>
        <CardFooter className="justify-start">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Excluir Projeto de forma Permanente</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Você tem absoluta certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isto excluirá permanentemente o projeto
                  <strong> {project.name} </strong> e removerá todos os dados do banco.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Sair e Manter</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault();
                    if (!deleteProject.isPending) handleDelete();
                  }}
                  variant="destructive"
                  disabled={deleteProject.isPending}
                >
                  {deleteProject.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Sim, quero excluir o projeto"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  )
}
