import { TemplateMockup } from "@/features/templates/components/TemplateMockup"
import { AlertCircle } from "lucide-react"
import type { Project } from "@/features/projects/types"
import type { Template } from "@/features/templates/types"

interface FlowMessageTabProps {
  project: Project
  templates: Template[]
}

export function FlowMessageTab({ project, templates }: FlowMessageTabProps) {
  const selectedTemplate = templates.find((t) => t.sid === project.templateSid)

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
    <div className="flex flex-col items-center justify-center py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h3 className="font-semibold">Mensagem de Resposta</h3>
          <p className="text-xs text-muted-foreground mt-1 px-4">
            Como sua mensagem automática aparecerá logo após a interação do usuário.
          </p>
        </div>
        
        <div className="pointer-events-none">
          <TemplateMockup template={selectedTemplate}>
            {/* Simulated User Response */}
            <div className="flex w-full justify-end animate-in fade-in slide-in-from-bottom-2 duration-300 mt-2">
              <div className="bg-[#dcf8c6] p-2 rounded-t-lg rounded-bl-lg rounded-br-none shadow-sm max-w-[85%] text-sm">
                <p className="whitespace-pre-wrap text-slate-800">Interação do usuário</p>
                <div className="text-right text-[10px] text-emerald-700/60 mt-1">10:01</div>
              </div>
            </div>

            {/* Simulated Bot Flow Message */}
            <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300 mt-1">
              <div className="bg-white p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm">
                <p className="whitespace-pre-wrap">{project.flowMessage}</p>
                <div className="text-right text-[10px] text-gray-400 mt-1">10:02</div>
              </div>
            </div>
          </TemplateMockup>
        </div>
      </div>
    </div>
  )
}
