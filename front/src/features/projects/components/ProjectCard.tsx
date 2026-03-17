import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Phone, Building2 } from "lucide-react"
import type { Project } from "@/features/projects/types"

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="transition-colors hover:bg-accent/40">
      <CardContent className="flex items-center gap-4">
        <Avatar size="lg" className="size-12">
          {project.image && (
            <AvatarImage src={project.image} alt={project.name} />
          )}
          <AvatarFallback className="text-base font-semibold">
            {getInitials(project.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col gap-1 overflow-hidden">
          <span className="truncate text-sm font-semibold leading-none">
            {project.name}
          </span>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Phone className="size-3 shrink-0" />
              {project.phoneNumber}
            </span>

            {project.agency && (
              <span className="flex items-center gap-1">
                <Building2 className="size-3 shrink-0" />
                {project.agency}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
