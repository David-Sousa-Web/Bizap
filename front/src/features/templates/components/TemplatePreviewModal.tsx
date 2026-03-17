import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Template } from "@/features/templates/types"
import { TemplateMockup } from "./TemplateMockup"
import { TEMPLATE_TYPES_INFO } from "../constants"
import { Info } from "lucide-react"

interface TemplatePreviewModalProps {
  template: Template | null
  isOpen: boolean
  onClose: () => void
}

export function TemplatePreviewModal({
  template,
  isOpen,
  onClose,
}: TemplatePreviewModalProps) {
  const typeInfo = template ? TEMPLATE_TYPES_INFO.find(
    info => template.type.toLowerCase().includes(info.type.toLowerCase())
  ) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-4xl p-0 overflow-hidden">
        <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
          {/* Lado Esquerdo: Mockup Mobile (Fundo Claro) */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-center items-center bg-slate-50 relative">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 absolute top-6 left-1/2 -translate-x-1/2 md:relative md:top-auto md:left-auto md:translate-x-0">
              Pré-visualização
            </h2>
            {template ? (
              <TemplateMockup template={template} />
            ) : (
              <div className="h-[500px] flex items-center justify-center text-muted-foreground w-full">
                Nenhum template selecionado.
              </div>
            )}
          </div>

          {/* Lado Direito: Informações Contextuais (Fundo Branco) */}
          <div className="w-full md:w-1/2 p-6 flex flex-col justify-center bg-white border-t md:border-t-0 md:border-l border-slate-100">
            <DialogHeader className="mb-6 text-left">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl bg-slate-50 border border-slate-100 rounded-lg p-2 shadow-sm w-12 h-12 flex items-center justify-center shrink-0">
                  {typeInfo?.icon || '🧩'}
                </span>
                <span className="text-gray-900">{typeInfo?.name || template?.type}</span>
              </DialogTitle>
              <DialogDescription className="mt-2 text-sm">
                Nome do Template: <strong className="text-gray-700">{template?.name}</strong>
              </DialogDescription>
              <div className="mt-1">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                  {template?.type}
                </span>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {typeInfo ? (
                <>
                  <div>
                    <h4 className="text-sm font-bold tracking-wide text-gray-400 uppercase mb-2">
                       Sobre este formato
                    </h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {typeInfo.desc}
                    </p>
                  </div>

                  <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                     <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-blue-900 mb-1">
                            Melhores Práticas de UI/UX
                          </h4>
                          <p className="text-sm text-blue-800/80 leading-relaxed">
                            {typeInfo.details}
                          </p>
                        </div>
                     </div>
                  </div>
                </>
              ) : (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm">
                  Não há documentação detalhada disponível para este tipo de template específico.
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
