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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {templates.map((template) => {
            const isSelected = selectedSid === template.sid

            return (
              <Card
                key={template.sid}
                className={cn(
                  "cursor-pointer transition-all hover:ring-2 hover:ring-primary/50",
                  isSelected && "ring-2 ring-primary bg-primary/5",
                )}
                onClick={() => handleSelect(template)}
              >
                <CardContent className="flex flex-col gap-3 py-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold truncate">
                      {template.name}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isSelected && (
                        <div className="flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3" />
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-7 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPreviewTemplate(template)
                        }}
                      >
                        <Eye className="size-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="pointer-events-none scale-[0.55] origin-top -mb-[45%]">
                    <TemplateMockup template={template} />
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
