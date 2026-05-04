import { useFormContext } from "react-hook-form"
import {
  Pencil,
  Phone,
  Building2,
  FileText,
  MessageSquare,
  Activity,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTemplates } from "@/features/templates/hooks/useTemplates"
import type { CreateProjectFormData } from "@/features/projects/schemas/createProjectSchema"

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

interface SummaryStepProps {
  imageFile: File | null
  onGoToStep: (step: number) => void
}

export function SummaryStep({ imageFile, onGoToStep }: SummaryStepProps) {
  const { getValues } = useFormContext<CreateProjectFormData>()
  const values = getValues()

  const { data: response } = useTemplates({ limit: 100 })
  const templates = response?.data ?? []
  const selectedTemplate = templates.find((t) => t.sid === values.templateSid)

  const imagePreviewUrl = imageFile ? URL.createObjectURL(imageFile) : null

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Resumo</h2>
        <p className="text-sm text-muted-foreground">
          Confira os dados do projeto antes de criar. Clique em "Editar" para
          alterar qualquer etapa.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Project identity */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Dados do projeto</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(0)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar size="lg" className="size-14">
              {imagePreviewUrl && (
                <AvatarImage src={imagePreviewUrl} alt={values.name} />
              )}
              <AvatarFallback className="text-lg font-semibold">
                {getInitials(values.name || "P")}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1 overflow-hidden">
              <span className="font-semibold truncate">{values.name}</span>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Phone className="size-3.5 shrink-0" />
                  {values.phoneNumber}
                </span>
                {values.agency && (
                  <span className="flex items-center gap-1">
                    <Building2 className="size-3.5 shrink-0" />
                    {values.agency}
                  </span>
                )}
                {values.zabbixHostName && (
                  <span className="flex items-center gap-1">
                    <Activity className="size-3.5 shrink-0" />
                    {values.zabbixHostName}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Template */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Template selecionado</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(1)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              <FileText className="size-4 text-muted-foreground shrink-0" />
              <span className="font-medium">
                {selectedTemplate?.name ?? values.templateSid}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                ({values.templateSid})
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Flow message */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Mensagem de resposta</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(2)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-2 text-sm">
              <MessageSquare className="size-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-muted-foreground whitespace-pre-wrap">
                {values.flowMessage}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-sm">Imagem</CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onGoToStep(3)}
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
          </CardHeader>
          <CardContent>
            {imagePreviewUrl ? (
              <div className="flex items-center gap-3">
                <img
                  src={imagePreviewUrl}
                  alt="Imagem do projeto"
                  className="size-16 rounded-full object-cover ring-2 ring-border"
                />
                <span className="text-sm text-muted-foreground">
                  {imageFile?.name}
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma imagem selecionada
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
