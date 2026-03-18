import { Building2, Phone } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import type { Project } from "@/features/projects/types"

interface BasicDataTabProps {
  project: Project
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

export function BasicDataTab({ project }: BasicDataTabProps) {
  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start gap-6 p-6">
          <Avatar className="size-24 rounded-2xl ring-2 ring-primary/20">
            {project.image ? (
              <AvatarImage src={project.image} alt={project.name} className="object-cover" />
            ) : null}
            <AvatarFallback className="text-3xl font-semibold rounded-2xl">
              {getInitials(project.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col gap-4 w-full">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Criado recentemente (Id: <span className="font-mono">{project.id}</span>)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
                <Phone className="size-4 text-primary shrink-0" />
                <span className="font-medium">{project.phoneNumber}</span>
              </div>
              
              {project.agency && (
                <div className="flex items-center gap-2 bg-muted/40 px-3 py-2 rounded-lg border border-border/50">
                  <Building2 className="size-4 text-primary shrink-0" />
                  <span className="font-medium">{project.agency}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
