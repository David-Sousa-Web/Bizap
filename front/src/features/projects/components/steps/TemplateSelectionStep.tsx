import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { Check, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useTemplates } from "@/features/templates/hooks/useTemplates"
import { TemplateMockup } from "@/features/templates/components/TemplateMockup"
import { TemplatePreviewModal } from "@/features/templates/components/TemplatePreviewModal"
import { getTypeConfig } from "@/features/templates/utils"
import type { Template } from "@/features/templates/types"
import type { CreateProjectFormData } from "@/features/projects/schemas/createProjectSchema"

export function TemplateSelectionStep() {
  const { setValue, watch, formState: { errors } } = useFormContext<CreateProjectFormData>()
  const selectedSid = watch("templateSid")
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const { data: response, isLoading } = useTemplates({ limit: 100 })
  const templates = response?.data ?? []

  function handleSelect(template: Template) {
    setValue("templateSid", template.sid, { shouldValidate: true })
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Selecione um template</h2>
        <p className="text-sm text-muted-foreground">
          Escolha o template pré-aprovado que será usado nas mensagens deste
          projeto.
        </p>
        {errors.templateSid && (
          <p className="text-sm text-destructive">
            {errors.templateSid.message}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="flex flex-col items-center gap-3 py-6">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && templates.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          Nenhum template disponível.
        </p>
      )}

      {!isLoading && templates.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => {
            const isSelected = selectedSid === template.sid
            const typeConfig = getTypeConfig(template.type)

            return (
              <Card
                key={template.sid}
                className={cn(
                  "group relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 py-0",
                  isSelected && "ring-2 ring-primary bg-primary/5",
                )}
                onClick={() => handleSelect(template)}
              >
                <CardContent className="flex flex-col gap-3 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col overflow-hidden pr-2">
                      <span className="text-sm font-semibold truncate">
                        {template.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                        {template.sid}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 pt-0.5">
                      {isSelected && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pointer-events-none flex h-[240px] w-full justify-center">
                    <div className="origin-top scale-[0.55]">
                      <TemplateMockup template={template} />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 z-0">
                    <span className="flex items-center rounded-md bg-secondary/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground shadow-sm backdrop-blur-sm ring-1 ring-border/50">
                      <typeConfig.icon className="mr-1 size-3" />
                      {typeConfig.label}
                    </span>
                  </div>

                  <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 transition-all duration-200 group-hover:opacity-100 bg-background/20">
                    <Button
                      type="button"
                      variant="secondary"
                      className="shadow-md"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPreviewTemplate(template)
                      }}
                    >
                      <Eye className="mr-2 size-4" />
                      Ver detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <TemplatePreviewModal
        template={previewTemplate}
        isOpen={!!previewTemplate}
        onClose={() => setPreviewTemplate(null)}
      />
    </div>
  )
}
