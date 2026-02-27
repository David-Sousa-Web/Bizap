import { FolderKanban } from "lucide-react"

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Projetos</h1>
      <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed p-12 text-center">
        <FolderKanban className="size-10 text-muted-foreground" />
        <p className="text-muted-foreground">
          Gerencie seus projetos de envio. Esta página será construída em breve.
        </p>
      </div>
    </div>
  )
}
