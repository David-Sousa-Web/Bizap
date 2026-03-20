import { useState } from "react"
import { AlertCircle, Puzzle, Info, Check, Eye, RefreshCw, Loader2, X, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { TemplateMockup } from "@/features/templates/components/TemplateMockup"
import { TemplatePreviewModal } from "@/features/templates/components/TemplatePreviewModal"
import { TEMPLATE_TYPES_INFO } from "@/features/templates/constants"
import { getTypeConfig } from "@/features/templates/utils"
import { useTemplates } from "@/features/templates/hooks/useTemplates"
import { useDebounce } from "@/hooks/useDebounce"

import type { Project } from "@/features/projects/types"
import type { Template } from "@/features/templates/types"
import { useUpdateProject } from "@/features/projects/hooks/useUpdateProject"

interface TemplateTabProps {
  project: Project
  templates: Template[]
}

export function TemplateTab({ project, templates }: TemplateTabProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tempSelectedSid, setTempSelectedSid] = useState<string>(project.templateSid)
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const debouncedSearch = useDebounce(search, 500)

  // Query independente para a aba de edição
  const { data: response, isLoading } = useTemplates({
    page,
    limit: 12,
    ...(debouncedSearch ? { search: debouncedSearch } : {})
  })
  
  const gridTemplates = response?.data ?? []
  const meta = response?.meta

  const updateProject = useUpdateProject()

  const selectedTemplate = templates.find((t) => t.sid === project.templateSid)

  async function handleSave() {
    if (tempSelectedSid === project.templateSid) {
      setIsEditing(false)
      return
    }

    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: { templateSid: tempSelectedSid },
      })
      toast.success("Template atualizado com sucesso!")
      setIsEditing(false)
    } catch {
      toast.error("Ocorreu um erro ao atualizar o template.")
    }
  }

  function handleCancel() {
    setTempSelectedSid(project.templateSid)
    setIsEditing(false)
  }

  if (!selectedTemplate && !isEditing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed text-muted-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
        <AlertCircle className="size-10 mb-4 text-muted-foreground/50" />
        <h3 className="font-medium text-lg">Template não encontrado</h3>
        <p className="text-sm mt-1 max-w-sm mb-6">
          O template configurado neste projeto (<strong>{project.templateSid}</strong>) não foi retornado pela API da Twilio.
        </p>
        <Button onClick={() => setIsEditing(true)}>
          <RefreshCw className="mr-2 size-4" /> Selecionar outro template
        </Button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 relative bg-card p-6 rounded-xl border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Alterar Template</h2>
            <p className="text-sm text-muted-foreground">
              Selecione o novo template que será usado nas mensagens deste projeto.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
            <div className="relative w-full sm:w-[250px]">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Pesquisar..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={updateProject.isPending}>
                <X className="mr-2 size-4" /> Cancelar
              </Button>
              <Button size="sm" onClick={handleSave} disabled={updateProject.isPending}>
                {updateProject.isPending ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Check className="mr-2 size-4" />
                )}
                Salvar
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="flex flex-col items-center gap-3 py-6">
                  <Skeleton className="h-40 w-full rounded-lg" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : gridTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Nenhum template encontrado.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gridTemplates.map((template) => {
              const isSelected = tempSelectedSid === template.sid
              const typeConfig = getTypeConfig(template.type)

              return (
                <Card
                  key={template.sid}
                  className={cn(
                    "group relative cursor-pointer overflow-hidden transition-all hover:ring-2 hover:ring-primary/50 py-0",
                    isSelected && "ring-2 ring-primary bg-primary/5",
                  )}
                  onClick={() => setTempSelectedSid(template.sid)}
                >
                  <CardContent className="flex flex-col gap-3 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex flex-col overflow-hidden pr-2">
                        <span className="text-sm font-semibold truncate" title={template.name}>
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

        {meta && meta.totalPages > 1 && !isLoading && (
          <div className="flex sm:flex-row flex-col items-center justify-between border-t border-border/50 pt-5 mt-2 gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Mostrando <span className="font-medium">{(meta.page - 1) * meta.limit + 1}</span> a{' '}
              <span className="font-medium">{Math.min(meta.page * meta.limit, meta.total)}</span>{' '}
              de <span className="font-medium">{meta.total}</span> templates
            </p>
            <div className="flex items-center space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="size-4 mr-1" />
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
              >
                Próximo
                <ChevronRight className="size-4 ml-1" />
              </Button>
            </div>
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

  // Read Mode
  const typeInfo = selectedTemplate ? TEMPLATE_TYPES_INFO.find(
    info => selectedTemplate.type.toLowerCase().includes(info.type.toLowerCase())
  ) : null;

  return (
    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300 border rounded-xl overflow-hidden bg-white">
      <div className="flex flex-col md:flex-row">
        {/* Lado Esquerdo: Mockup Mobile */}
        <div className="w-full md:w-5/12 p-6 flex flex-col justify-center items-center bg-slate-50 relative border-b md:border-b-0 md:border-r border-border/50 min-h-[500px]">
          <h2 className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest mb-6 w-full text-center">
            Padrão Instalado
          </h2>
          {selectedTemplate ? (
            <div className="scale-[0.85] origin-top">
              <TemplateMockup template={selectedTemplate} />
            </div>
          ) : (
            <Skeleton className="h-[400px] w-[280px] rounded-3xl" />
          )}
        </div>

        {/* Lado Direito: Informações */}
        <div className="w-full md:w-7/12 p-8 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-slate-50 border border-slate-100 rounded-lg p-2.5 shadow-sm shrink-0 text-slate-700">
                  {(() => {
                    const ConfigIcon = selectedTemplate ? getTypeConfig(selectedTemplate.type).icon : null;
                    return ConfigIcon ? <ConfigIcon className="size-6" /> : <Puzzle className="size-6 text-slate-400" />;
                  })()}
                </span>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-gray-900 leading-none mb-1.5">
                    {selectedTemplate?.name}
                  </h3>
                  <p className="text-[13px] font-mono text-muted-foreground">{selectedTemplate?.sid}</p>
                </div>
              </div>
              <div className="flex">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wider">
                  {typeInfo?.name || selectedTemplate?.type}
                </span>
              </div>
            </div>

            <Button variant="outline" className="shrink-0" onClick={() => setIsEditing(true)}>
              <RefreshCw className="mr-2 size-4" /> Trocar Template
            </Button>
          </div>

          <div className="space-y-6 mt-2 flex-grow">
            {typeInfo ? (
              <>
                <div className="space-y-2">
                  <h4 className="text-[12px] font-bold tracking-widest text-muted-foreground/80 uppercase">
                    Sobre este formato
                  </h4>
                  <p className="text-[14.5px] text-gray-600 leading-relaxed max-w-xl">
                    {typeInfo.desc}
                  </p>
                </div>

                <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-5 max-w-xl">
                  <div className="flex items-start gap-3">
                    <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[13px] font-bold text-blue-900 mb-1.5 uppercase tracking-wide">
                        Melhores Práticas de UI/UX
                      </h4>
                      <p className="text-[14px] text-blue-800/90 leading-relaxed">
                        {typeInfo.details}
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl text-orange-800 text-sm max-w-xl">
                Não há documentação detalhada disponível para este tipo de template específico.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
