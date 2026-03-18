import { TemplateMockup } from "@/features/templates/components/TemplateMockup"
import { AlertCircle } from "lucide-react"
import type { Project } from "@/features/projects/types"
import type { Template } from "@/features/templates/types"

interface TemplateTabProps {
  project: Project
  templates: Template[]
}

export function TemplateTab({ project, templates }: TemplateTabProps) {
  const selectedTemplate = templates.find((t) => t.sid === project.templateSid)

  if (!selectedTemplate) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
        <AlertCircle className="size-10 mb-4 text-muted-foreground/50" />
        <h3 className="font-medium text-lg">Template não encontrado</h3>
        <p className="text-sm mt-1 max-w-sm">
          O template configurado neste projeto (<strong>{project.templateSid}</strong>) não foi retornado pela API.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h3 className="font-semibold">{selectedTemplate.name}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">{selectedTemplate.sid}</p>
        </div>
        
        <div className="pointer-events-none">
          <TemplateMockup template={selectedTemplate} />
        </div>
      </div>
    </div>
  )
}
