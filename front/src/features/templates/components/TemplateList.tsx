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

const STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  approved: "default",
  pending: "outline",
  rejected: "destructive",
  unsubmitted: "secondary",
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
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden md:table-cell">Conteúdo</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {templates.map((template) => (
          <TableRow key={template.sid}>
            <TableCell className="font-medium">{template.name}</TableCell>
            <TableCell>
              <Badge variant="secondary">{template.type}</Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={STATUS_VARIANT[template.whatsappStatus] ?? "outline"}
              >
                {template.whatsappStatus}
              </Badge>
            </TableCell>
            <TableCell className="hidden max-w-xs truncate md:table-cell">
              {extractBodyText(template.body)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
