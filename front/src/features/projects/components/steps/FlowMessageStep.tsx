import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTemplates } from "@/features/templates/hooks/useTemplates"
import { TemplateMockup } from "@/features/templates/components/TemplateMockup"
import type { Template } from "@/features/templates/types"
import type { CreateProjectFormData } from "@/features/projects/schemas/createProjectSchema"

export function FlowMessageStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<CreateProjectFormData>()

  const templateSid = watch("templateSid")
  const flowMessage = watch("flowMessage")

  const { data: response } = useTemplates({ limit: 100 })
  const templates = response?.data ?? []
  const selectedTemplate = templates.find((t) => t.sid === templateSid)

  // Create a preview template with the flow message as body content
  const previewTemplate: Template | undefined = selectedTemplate
    ? {
        ...selectedTemplate,
        body: {
          ...(selectedTemplate.body ?? {}),
          body: flowMessage || "(sua mensagem aparecerá aqui)",
        },
      }
    : undefined

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Mensagem de resposta</h2>
        <p className="text-sm text-muted-foreground">
          Escreva a mensagem que será enviada como resposta automática usando o
          template selecionado.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="flowMessage">
            Mensagem <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="flowMessage"
            placeholder="Digite a mensagem de resposta do seu projeto..."
            className="min-h-[200px] resize-none"
            {...register("flowMessage")}
          />
          {errors.flowMessage && (
            <p className="text-sm text-destructive">
              {errors.flowMessage.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            A mensagem será exibida dentro do template selecionado.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Pré-visualização</span>
          {previewTemplate ? (
            <div className="scale-[0.65] origin-top -mb-[35%]">
              <TemplateMockup template={previewTemplate} />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Nenhum template selecionado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
