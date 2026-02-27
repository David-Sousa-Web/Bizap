import { FileText } from "lucide-react"

export default function TemplatesPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Templates</h1>
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <FileText className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          Gerencie seus templates de mensagem. Esta página será construída em
          breve.
        </p>
      </div>
    </div>
  )
}
