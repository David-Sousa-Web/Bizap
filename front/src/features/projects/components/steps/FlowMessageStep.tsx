import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTemplates } from "@/features/templates/hooks/useTemplates"
import { TemplateMockup } from "@/features/templates/components/TemplateMockup"
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

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Mensagem de resposta</h2>
        <p className="text-sm text-muted-foreground">
          Escreva a mensagem que será enviada como resposta automática após o 
          usuário interagir com o template inicial.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="flowMessage">
            Mensagem <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="flowMessage"
            placeholder="Digite a mensagem de resposta automática..."
            className="min-h-[200px] resize-none"
            {...register("flowMessage")}
          />
          {errors.flowMessage && (
            <p className="text-sm text-destructive">
              {errors.flowMessage.message}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            A mensagem será exibida na sequência, como uma resposta do bot à interação do usuário.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Pré-visualização</span>
          {selectedTemplate ? (
            <div className="scale-[0.65] origin-top -mb-[35%] pointer-events-none">
              <TemplateMockup template={selectedTemplate}>
                {/* Simulated User Response */}
                <div className="flex w-full justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-[#dcf8c6] p-2 rounded-t-lg rounded-bl-lg rounded-br-none shadow-sm max-w-[85%] text-sm">
                    <p className="whitespace-pre-wrap text-slate-800">Interação do usuário</p>
                    <div className="text-right text-[10px] text-emerald-700/60 mt-1">10:01</div>
                  </div>
                </div>

                {/* Simulated Bot Flow Message */}
                <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="bg-white p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm">
                    <p className="whitespace-pre-wrap">{flowMessage || "(sua mensagem aparecerá aqui)"}</p>
                    <div className="text-right text-[10px] text-gray-400 mt-1">10:02</div>
                  </div>
                </div>
              </TemplateMockup>
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
