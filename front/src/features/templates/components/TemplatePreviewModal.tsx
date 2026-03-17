import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import type { Template } from "@/features/templates/types"
import { TemplateMockup } from "./TemplateMockup"

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
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Pré-visualização do Template</DialogTitle>
          <DialogDescription>
            {template?.name} <span className="text-xs font-mono ml-2 opacity-70">({template?.type})</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 flex justify-center bg-slate-50 rounded-md border border-slate-100 mt-2">
          {template ? (
            <TemplateMockup template={template} />
          ) : (
            <div className="h-[500px] flex items-center justify-center text-muted-foreground">
              Nenhum template selecionado.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
