import { Badge } from "@/components/ui/badge"
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
  Type,
  Layers,
  ThumbsUp,
  ShieldCheck,
  List,
  ShoppingCart,
  IdCard,
  CreditCard,
  ImageIcon,
  MousePointerClick,
  GalleryHorizontal,
  HelpCircle,
  Info,
  CheckCircle2,
} from "lucide-react"

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

function getTypeConfig(type: string) {
  const t = type?.toLowerCase() || ""
  if (t.includes("text")) return { icon: Type, label: type }
  if (t.includes("flow")) return { icon: Layers, label: type }
  if (t.includes("quick") || t.includes("reply"))
    return { icon: ThumbsUp, label: type }
  if (t.includes("auth")) return { icon: ShieldCheck, label: type }
  if (t.includes("list")) return { icon: List, label: type }
  if (t.includes("catalog")) return { icon: ShoppingCart, label: type }
  if (t.includes("whatsapp card")) return { icon: IdCard, label: type }
  if (t.includes("card")) return { icon: CreditCard, label: type }
  if (t.includes("media")) return { icon: ImageIcon, label: type }
  if (t.includes("call-to-action") || t.includes("cta"))
    return { icon: MousePointerClick, label: type }
  if (t.includes("carousel")) return { icon: GalleryHorizontal, label: type }
  return { icon: HelpCircle, label: type }
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
  return (
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
              <TableCell className="hidden max-w-xs truncate md:table-cell text-muted-foreground">
                {extractBodyText(template.body)}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
