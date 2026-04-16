import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Phone,
  Building2,
  Info,
  LayoutTemplate,
  MessageSquare,
  Users,
  Trash2,
  MoreHorizontal,
} from "lucide-react"

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
  const navigate = useNavigate()
  const [imageStatus, setImageStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('loading')

  return (
    <Card
      onClick={() => navigate(`/projetos/${project.id}`)}
      className="relative transition-colors hover:bg-accent/40 cursor-pointer py-0"
    >
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="size-11 shrink-0">
            {project.image && (
              <AvatarImage 
                src={project.image} 
                alt={project.name} 
                onLoadingStatusChange={setImageStatus}
              />
            )}
            <AvatarFallback className="text-[13px] font-semibold">
              {project.image && imageStatus !== 'error' && imageStatus !== 'loaded' ? (
                <Skeleton className="size-full rounded-full" />
              ) : (
                getInitials(project.name)
              )}
            </AvatarFallback>
          </Avatar>

          <span className="truncate text-[15px] font-semibold leading-none pr-8 flex-1">
            {project.name}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 text-[13px] text-muted-foreground ml-1">
          <span className="flex items-center gap-2">
            <Phone className="size-3.5 shrink-0" />
            {project.phoneNumber}
          </span>

          {project.agency && (
            <span className="flex items-center gap-2">
              <Building2 className="size-3.5 shrink-0" />
              {project.agency}
            </span>
          )}
        </div>
      </CardContent>

      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
              <span className="sr-only">Ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[180px]">
            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
              onSelect={() => navigate(`/projetos/${project.id}`)}
            >
              <Info className="mr-2 size-4" />
              Informações
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
              onSelect={() => navigate(`/projetos/${project.id}?tab=template`)}
            >
              <LayoutTemplate className="mr-2 size-4" />
              Editar Template
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
              onSelect={() => navigate(`/projetos/${project.id}?tab=mensagem`)}
            >
              <MessageSquare className="mr-2 size-4" />
              Editar Mensagem
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => e.stopPropagation()}
              onSelect={() => navigate(`/projetos/${project.id}?tab=numeros`)}
            >
              <Users className="mr-2 size-4" />
              Ver Números
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={(e) => e.stopPropagation()}
              onSelect={() => navigate(`/projetos/${project.id}?tab=avancado`)}
            >
              <Trash2 className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  )
}
