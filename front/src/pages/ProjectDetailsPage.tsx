import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useProject } from "@/features/projects/hooks/useProject"
import { useTemplates } from "@/features/templates/hooks/useTemplates"
import { BasicDataTab } from "@/features/projects/components/tabs/BasicDataTab"
import { TemplateTab } from "@/features/projects/components/tabs/TemplateTab"
import { FlowMessageTab } from "@/features/projects/components/tabs/FlowMessageTab"
import { NumbersTab } from "@/features/projects/components/tabs/NumbersTab"
import { AdvancedTab } from "@/features/projects/components/tabs/AdvancedTab"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProjectDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: projectResponse, isLoading, isError } = useProject(id)
  const project = projectResponse?.data

  const { data: templatesResponse } = useTemplates({ limit: 100 })
  const templates = templatesResponse?.data ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/projetos")}>
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    )
  }

  if (isError || !project) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground w-full">
        <AlertCircle className="size-10 mb-4 text-muted-foreground/50" />
        <h3 className="font-medium text-lg">Projeto não encontrado</h3>
        <p className="text-sm mt-1 mb-6">
          Ocorreu um erro ao buscar o projeto ou ele não existe mais.
        </p>
        <Button onClick={() => navigate("/projetos")} variant="outline">
          <ArrowLeft className="mr-2 size-4" />
          Voltar para Projetos
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/projetos")}>
            <ArrowLeft className="size-4" />
            Voltar
          </Button>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight">Detalhes do Projeto</h1>
            <span className="text-sm text-muted-foreground">{project.name}</span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dados" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full grid-cols-2 md:inline-flex md:grid-cols-none md:w-auto h-auto p-1 bg-muted/50 rounded-lg">
            <TabsTrigger value="dados" className="py-2.5">Dados</TabsTrigger>
            <TabsTrigger value="template" className="py-2.5">Template</TabsTrigger>
            <TabsTrigger value="mensagem" className="py-2.5">Mensagem</TabsTrigger>
            <TabsTrigger value="numeros" className="py-2.5">Números</TabsTrigger>
            <TabsTrigger value="avancado" className="py-2.5">Avançado</TabsTrigger>
          </TabsList>
        </div>

        <div className="mt-6 w-full max-w-4xl">
          <TabsContent value="dados" className="m-0 border-0 p-0 focus-visible:ring-0">
            <BasicDataTab project={project} />
          </TabsContent>
          <TabsContent value="template" className="m-0 border-0 p-0 focus-visible:ring-0">
            <TemplateTab project={project} templates={templates} />
          </TabsContent>
          <TabsContent value="mensagem" className="m-0 border-0 p-0 focus-visible:ring-0">
            <FlowMessageTab project={project} templates={templates} />
          </TabsContent>
          <TabsContent value="numeros" className="m-0 border-0 p-0 focus-visible:ring-0">
            <NumbersTab projectId={project.id} />
          </TabsContent>
          <TabsContent value="avancado" className="m-0 border-0 p-0 focus-visible:ring-0">
            <AdvancedTab project={project} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
