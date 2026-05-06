import { useState } from "react"
import { AlertCircle, Pencil, X, Check, Loader2, ImageIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { TemplateMockup } from "@/features/templates/components/TemplateMockup"
import { useUpdateFlowMessage } from "@/features/projects/hooks/useUpdateFlowMessage"

import type { Project } from "@/features/projects/types"
import type { Template } from "@/features/templates/types"

interface FlowMessageTabProps {
  project: Project
  templates: Template[]
}

export function FlowMessageTab({ project, templates }: FlowMessageTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempMessage, setTempMessage] = useState(project.flowMessage)

  const updateMessage = useUpdateFlowMessage()
  const selectedTemplate = templates.find((t) => t.sid === project.templateSid)

  async function handleSave() {
    if (tempMessage.trim() === project.flowMessage.trim()) {
      setIsEditing(false)
      return
    }

    if (!tempMessage.trim()) {
      toast.error("A mensagem não pode ficar vazia.")
      return
    }

    try {
      await updateMessage.mutateAsync({
        id: project.id,
        data: { flowMessage: tempMessage },
      })
      toast.success("Mensagem de resposta atualizada!")
      setIsEditing(false)
    } catch {
      toast.error("Erro ao atualizar mensagem.")
    }
  }

  function handleCancel() {
    setTempMessage(project.flowMessage)
    setIsEditing(false)
  }

  function handleStartEdit() {
    setTempMessage(project.flowMessage)
    setIsEditing(true)
  }

  if (!selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
        <AlertCircle className="size-10 mb-4 text-muted-foreground/50" />
        <h3 className="font-medium text-lg">Pré-visualização indisponível</h3>
        <p className="text-sm mt-1 max-w-sm">
          Não é possível visualizar a mensagem porque o template original ({project.templateSid}) não foi encontrado.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative bg-card rounded-xl border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Mensagem de Resposta</h2>
          <p className="text-sm text-muted-foreground">
            Como sua mensagem automática aparecerá após a interação do usuário.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Lado Esquerdo: Input de texto */}
        <div className="flex flex-col gap-5">
          {isEditing ? (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex flex-col gap-2">
                <Label htmlFor="flowMessage">
                  Mensagem <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="flowMessage"
                  placeholder="Digite a mensagem de resposta automática..."
                  className="min-h-[220px] resize-none"
                  value={tempMessage}
                  onChange={(e) => setTempMessage(e.target.value)}
                  disabled={updateMessage.isPending}
                />
                <p className="text-[13px] text-muted-foreground">
                  A mensagem será exibida na sequência, como uma resposta do bot à interação do usuário.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleCancel} disabled={updateMessage.isPending}>
                  <X className="mr-2 size-4" /> Cancelar
                </Button>
                <Button size="sm" onClick={handleSave} disabled={updateMessage.isPending}>
                  {updateMessage.isPending ? (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 size-4" />
                  )}
                  Salvar Mensagem
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Conteúdo Configurado
                </p>
                <Button variant="outline" size="sm" onClick={handleStartEdit}>
                  <Pencil className="mr-2 size-3.5" /> Editar Texto
                </Button>
              </div>
              <div className="bg-input/30 border border-input rounded-xl p-5 min-h-[200px]">
                <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
                  {project.flowMessage}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Lado Direito: Preview */}
        <div className="flex flex-col gap-2 relative">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:text-center">
            Simulação Visual
          </p>
          <div className="flex justify-center items-center w-full max-h-[500px]">
            <div className="scale-80 origin-top translate-y-2 border shadow-2xl rounded-[3rem] overflow-hidden bg-muted/20">
              <TemplateMockup template={selectedTemplate}>
                {/* Simulated User Response */}
                <div className="flex w-full justify-end mt-2">
                  <div className="bg-[#dcf8c6] dark:bg-[#005c4b] p-2.5 rounded-t-xl rounded-bl-xl rounded-br-sm shadow-sm max-w-[85%] text-[15px]">
                    <p className="whitespace-pre-wrap text-slate-800 dark:text-slate-100">Interação do usuário</p>
                    <div className="text-right text-[11px] text-emerald-700/60 dark:text-emerald-200/60 mt-1">10:01</div>
                  </div>
                </div>

                {/* Simulated Bot Flow Message */}
                <div className="flex flex-col gap-1 w-full mt-1.5 transition-all duration-300">
                  <div className="bg-white dark:bg-slate-800 rounded-t-xl rounded-br-xl rounded-bl-sm shadow-sm max-w-[90%] text-[15px] overflow-hidden">
                    <div
                      role="img"
                      aria-label="Imagem placeholder"
                      className="relative w-full h-24 flex items-center justify-center bg-[repeating-linear-gradient(45deg,#e2e8f0_0_8px,#f1f5f9_8px_16px)] dark:bg-[repeating-linear-gradient(45deg,#334155_0_8px,#1e293b_8px_16px)] border-b border-slate-200 dark:border-slate-700"
                    >
                      <ImageIcon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                      <span className="absolute bottom-1 right-2 text-[9px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                        Placeholder
                      </span>
                    </div>
                    <div className="p-3.5">
                      <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-100">
                        {(isEditing ? tempMessage : project.flowMessage) || <span className="text-slate-400 dark:text-slate-500 italic">(Vazio)</span>}
                      </p>
                      <div className="text-right text-[11px] text-slate-400 dark:text-slate-500 mt-1">10:02</div>
                    </div>
                  </div>
                </div>
              </TemplateMockup>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
