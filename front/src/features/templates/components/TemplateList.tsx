import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { Template } from "@/features/templates/types"
import {
  Info,
  CheckCircle2,
} from "lucide-react"

import { TemplatePreviewModal } from "./TemplatePreviewModal"
import { getTypeConfig } from "../utils"

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  approved: {
    label: "Aprovado",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  pending: {
    label: "Pendente",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
  },
  rejected: {
    label: "Rejeitado",
    className:
      "bg-destructive/10 text-destructive border-destructive/20 dark:text-red-400",
  },
  unsubmitted: {
    label: "Não enviado",
    className:
      "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  },
}



function extractBodyText(body: Record<string, unknown> | null): string {
  if (!body) return ""
  if (typeof body.body === "string") return body.body
  return JSON.stringify(body)
}

interface TemplateListProps {
  templates: Template[]
}

export function TemplateList({ templates }: TemplateListProps) {
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome / SID</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status WhatsApp</TableHead>
          <TableHead className="hidden md:table-cell">Conteúdo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => {
          const typeConfig = getTypeConfig(template.type)
          const statusConfig =
            STATUS_CONFIG[template.whatsappStatus?.toLowerCase()] || {
              label: template.whatsappStatus || "Desconhecido",
              className:
                "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
            }

          return (
            <TableRow key={template.sid}>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="font-semibold">
                    {template.name}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">
                    {template.sid}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <typeConfig.icon className="w-4 h-4 text-slate-500" />
                  <span className="capitalize">{typeConfig.label}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1.5">
                  <Badge variant="outline" className={statusConfig.className}>
                    {statusConfig.label}
                  </Badge>

                  {template.businessInitiated && (
                    <Badge
                      variant="outline"
                      className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1 font-normal text-xs"
                    >
                      <Info className="w-3 h-3" />
                      business initiated
                    </Badge>
                  )}
                  {template.userInitiated && (
                    <Badge
                      variant="outline"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 flex items-center gap-1 font-normal text-xs"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      user initiated
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground">
                <div className="relative group flex items-center justify-start h-full">
                  <div className="truncate max-w-[200px] xl:max-w-[300px] group-hover:opacity-0 transition-opacity">
                    {extractBodyText(template.body)}
                  </div>
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setPreviewTemplate(template)}
                    >
                      Ver conteúdo
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
    <TemplatePreviewModal
      template={previewTemplate}
      isOpen={!!previewTemplate}
      onClose={() => setPreviewTemplate(null)}
    />
    </>
  )
}
