import React, { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Phone, Pencil, Camera, Loader2, X, Check } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"

import type { Project } from "@/features/projects/types"
import { useUpdateProject } from "@/features/projects/hooks/useUpdateProject"
import { useUploadProjectImage } from "@/features/projects/hooks/useUploadProjectImage"
import { editProjectSchema, type EditProjectFormData } from "@/features/projects/schemas/editProjectSchema"

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
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const updateProject = useUpdateProject()
  const uploadImage = useUploadProjectImage()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProjectFormData>({
    resolver: zodResolver(editProjectSchema),
    defaultValues: {
      name: project.name,
      phoneNumber: project.phoneNumber,
      agency: project.agency || "",
    },
  })

  async function onSubmit(data: EditProjectFormData) {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data,
      })
      toast.success("Dados do projeto atualizados!")
      setIsEditing(false)
    } catch {
      toast.error("Ocorreu um erro ao salvar as alterações. Tente novamente.")
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Por favor, selecione um arquivo de imagem.")
      return
    }

    try {
      await uploadImage.mutateAsync({
        projectId: project.id,
        file,
      })
      toast.success("Imagem atualizada com sucesso!")
    } catch {
      toast.error("Falha ao atualizar a imagem. Tente novamente.")
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "" // reset
      }
    }
  }

  return (
    <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Card>
        <CardContent className="flex flex-col sm:flex-row items-start gap-6 p-6 relative">
          {!isEditing && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-4 right-4" 
              onClick={() => setIsEditing(true)}
              title="Editar dados"
            >
              <Pencil className="size-4 text-muted-foreground" />
            </Button>
          )}

          {/* Avatar com Upload (Sempre clicável) */}
          <div 
            className="relative group cursor-pointer shrink-0"
            onClick={() => fileInputRef.current?.click()}
            title="Trocar imagem do projeto"
          >
            <Avatar className="size-24 rounded-2xl ring-2 ring-primary/20">
              {project.image ? (
                <AvatarImage src={project.image} alt={project.name} className="object-cover" />
              ) : null}
              <AvatarFallback className="text-3xl font-semibold rounded-2xl">
                {getInitials(project.name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadImage.isPending ? (
                <Loader2 className="size-6 text-white animate-spin" />
              ) : (
                <Camera className="size-6 text-white" />
              )}
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
          </div>

          <div className="flex flex-col gap-4 w-full pt-2">
            {isEditing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 w-full">
                <div className="pr-8">
                  <Field data-invalid={!!errors.name}>
                    <Input 
                      id="name" 
                      placeholder="Nome do Projeto *" 
                      className="text-2xl font-bold tracking-tight h-auto px-3 py-1.5 w-full bg-background" 
                      {...register("name")} 
                    />
                    <FieldError>{errors.name?.message}</FieldError>
                  </Field>
                  <p className="text-sm text-muted-foreground mt-2 px-1 block">
                    ID: <span className="font-mono">{project.id}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-border/50 pt-6">
                  <div className="flex flex-col gap-1.5">
                    <Field data-invalid={!!errors.phoneNumber} className="space-y-2">
                      <FieldLabel htmlFor="phoneNumber" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Phone className="size-4" /> Telefone (WhatsApp) <span className="text-destructive">*</span>
                      </FieldLabel>
                      <Input 
                        id="phoneNumber" 
                        placeholder="+55 11 99999-9999" 
                        className="text-base font-semibold bg-background" 
                        {...register("phoneNumber")} 
                      />
                      <FieldError>{errors.phoneNumber?.message}</FieldError>
                    </Field>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <Field data-invalid={!!errors.agency} className="space-y-2">
                      <FieldLabel htmlFor="agency" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Building2 className="size-4" /> Agência
                      </FieldLabel>
                      <Input 
                        id="agency" 
                        placeholder="Nome da agência" 
                        className="text-base font-semibold bg-background" 
                        {...register("agency")} 
                      />
                      <FieldError>{errors.agency?.message}</FieldError>
                    </Field>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button 
                    type="submit" 
                    disabled={updateProject.isPending}
                    size="sm"
                  >
                    {updateProject.isPending ? (
                      <Loader2 className="size-4 mr-2 animate-spin" />
                    ) : (
                      <Check className="size-4 mr-2" />
                    )}
                    Salvar
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      reset()
                      setIsEditing(false)
                    }}
                    disabled={updateProject.isPending}
                    size="sm"
                  >
                    <X className="size-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col gap-8 w-full">
                <div className="pr-8">
                  <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1 cursor-text select-text block">
                    ID: <span className="font-mono">{project.id}</span>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-border/50 pt-6">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Phone className="size-4" /> Telefone (WhatsApp)
                    </span>
                    <span className="text-base font-semibold">{project.phoneNumber}</span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Building2 className="size-4" /> Agência
                    </span>
                    <span className="text-base font-semibold">
                      {project.agency ? project.agency : "Não informada"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
