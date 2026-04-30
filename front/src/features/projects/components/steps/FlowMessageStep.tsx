import { useFormContext } from "react-hook-form"
import { ImageIcon } from "lucide-react"
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

        <div className="flex flex-col gap-2 relative">
          <p className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 lg:text-center">
            Simulação Visual
          </p>
          {selectedTemplate ? (
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
                          {flowMessage || <span className="text-slate-400 dark:text-slate-500 italic">(Vazio)</span>}
                        </p>
                        <div className="text-right text-[11px] text-slate-400 dark:text-slate-500 mt-1">10:02</div>
                      </div>
                    </div>
                  </div>
                </TemplateMockup>
              </div>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground bg-slate-50 dark:bg-slate-900/50 dark:border-slate-800">
              Nenhum template selecionado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
