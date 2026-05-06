import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Copy,
  KeyRound,
  AlertTriangle,
  Loader2,
  Activity,
  Pencil,
  Check,
  X,
  Trash2,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { useDeleteProject } from "@/features/projects/hooks/useDeleteProject"
import { useUpdateProject } from "@/features/projects/hooks/useUpdateProject"
import type { Project } from "@/features/projects/types"
import {
  zabbixIntegrationSchema,
  type ZabbixIntegrationFormData,
} from "@/features/projects/schemas/editProjectSchema"
import { Badge } from "@/components/ui/badge"
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
  const updateProject = useUpdateProject()

  const [isEditingZabbix, setIsEditingZabbix] = useState(false)

  const {
    register: registerZabbix,
    handleSubmit: handleSubmitZabbix,
    reset: resetZabbix,
    formState: { errors: zabbixErrors },
  } = useForm<ZabbixIntegrationFormData>({
    resolver: zodResolver(zabbixIntegrationSchema),
    defaultValues: {
      zabbixHostName: project.zabbixHostName ?? "",
    },
  })

  function handleCopyApiKey() {
    navigator.clipboard.writeText(project.apiKey)
      .then(() => toast.success("API Key copiada para a área de transferência!"))
      .catch(() => toast.error("Falha ao copiar a API Key."))
  }

  async function onSubmitZabbix(data: ZabbixIntegrationFormData) {
    const trimmed = data.zabbixHostName?.trim() ?? ""
    const nextValue = trimmed.length > 0 ? trimmed : null

    if (nextValue === (project.zabbixHostName ?? null)) {
      setIsEditingZabbix(false)
      return
    }

    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: { zabbixHostName: nextValue },
      })
      toast.success(
        nextValue
          ? "Integração Zabbix atualizada com sucesso!"
          : "Integração Zabbix removida.",
      )
      setIsEditingZabbix(false)
    } catch {
      toast.error("Falha ao atualizar a integração Zabbix. Tente novamente.")
    }
  }

  async function handleRemoveZabbix() {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: { zabbixHostName: null },
      })
      resetZabbix({ zabbixHostName: "" })
      toast.success("Integração Zabbix removida.")
      setIsEditingZabbix(false)
    } catch {
      toast.error("Falha ao remover a integração Zabbix. Tente novamente.")
    }
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

      <Card>
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Integração Zabbix
          </CardTitle>
          <CardDescription>
            Vincule este projeto a um host cadastrado no Zabbix para enviar
            métricas de envio e respostas das mensagens.
          </CardDescription>
          {!isEditingZabbix && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
              onClick={() => {
                resetZabbix({ zabbixHostName: project.zabbixHostName ?? "" })
                setIsEditingZabbix(true)
              }}
              title="Editar integração Zabbix"
            >
              <Pencil className="size-4 text-muted-foreground" />
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingZabbix ? (
            <form
              onSubmit={handleSubmitZabbix(onSubmitZabbix)}
              className="flex flex-col gap-4 max-w-xl"
            >
              <div className="flex flex-col gap-2">
                <Label htmlFor="zabbixHostName">Host do Zabbix</Label>
                <Input
                  id="zabbixHostName"
                  placeholder="Ex: bizap-cliente-xyz"
                  className="font-mono text-sm"
                  {...registerZabbix("zabbixHostName")}
                />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco e salve para desativar a integração com o
                  Zabbix neste projeto.
                </p>
                {zabbixErrors.zabbixHostName && (
                  <p className="text-sm text-destructive">
                    {zabbixErrors.zabbixHostName.message}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                {project.zabbixHostName ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveZabbix}
                    disabled={updateProject.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Remover integração
                  </Button>
                ) : (
                  <span />
                )}

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetZabbix({
                        zabbixHostName: project.zabbixHostName ?? "",
                      })
                      setIsEditingZabbix(false)
                    }}
                    disabled={updateProject.isPending}
                  >
                    <X className="size-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={updateProject.isPending}
                  >
                    {updateProject.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="size-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            <div className="flex flex-col gap-2 max-w-xl">
              <Label className="text-muted-foreground">Host configurado</Label>
              {project.zabbixHostName ? (
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={project.zabbixHostName}
                    className="font-mono text-sm"
                  />
                  <Badge variant="secondary" className="shrink-0">
                    Ativo
                  </Badge>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  <Activity className="size-4" />
                  Nenhum host configurado para este projeto.
                </div>
              )}
            </div>
          )}
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
