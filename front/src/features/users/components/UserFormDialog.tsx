import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { isAxiosError } from "axios"
import { Eye, EyeOff, Loader2, Mail, Save, ShieldCheck, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCreateUser } from "@/features/users/hooks/useCreateUser"
import { useUpdateUser } from "@/features/users/hooks/useUpdateUser"
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
  type UpdateUserFormData,
} from "@/features/users/schemas/userSchema"
import type { User as UserType } from "@/features/users/types"
import type { UserRole } from "@/types/auth"

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
} & (
  | { mode: "create"; user?: never }
  | { mode: "edit"; user: UserType }
)

const ROLE_OPTIONS: { value: UserRole; label: string; description: string }[] =
  [
    {
      value: "ADMIN",
      label: "Administrador",
      description: "Acesso total à plataforma e gestão de usuários.",
    },
    {
      value: "EDITOR",
      label: "Editor",
      description: "Pode criar e editar projetos, números e mídias.",
    },
    {
      value: "USER",
      label: "Usuário",
      description: "Acesso somente leitura aos projetos e templates.",
    },
  ]

export function UserFormDialog(props: UserFormDialogProps) {
  if (props.mode === "create") {
    return <CreateDialog {...props} />
  }
  return <EditDialog {...props} />
}

interface CreateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CreateDialog({ open, onOpenChange }: CreateDialogProps) {
  const createUser = useCreateUser()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  })

  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => setFocus("name"), 50)
    return () => window.clearTimeout(id)
  }, [open, setFocus])

  const isPending = createUser.isPending

  function handleOpenChange(next: boolean) {
    if (isPending) return
    if (!next) {
      reset({ name: "", email: "", password: "", role: "USER" })
      setShowPassword(false)
    }
    onOpenChange(next)
  }

  async function onSubmit(data: CreateUserFormData) {
    try {
      await createUser.mutateAsync(data)
      handleOpenChange(false)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError("email", {
          type: "manual",
          message: "Já existe um usuário com esse e-mail.",
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo usuário</DialogTitle>
          <DialogDescription>
            Cadastre um novo usuário definindo o nível de acesso desejado.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <Field data-invalid={!!errors.name}>
            <FieldLabel
              htmlFor="user-name"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <User className="size-4" /> Nome{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="user-name"
              placeholder="Ex: João Silva"
              autoComplete="off"
              disabled={isPending}
              {...register("name")}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel
              htmlFor="user-email"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Mail className="size-4" /> E-mail{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="user-email"
              type="email"
              placeholder="usuario@email.com"
              autoComplete="off"
              disabled={isPending}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.password}>
            <FieldLabel
              htmlFor="user-password"
              className="flex items-center gap-2 text-sm font-medium"
            >
              Senha <span className="text-destructive">*</span>
            </FieldLabel>
            <div className="relative">
              <Input
                id="user-password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••"
                autoComplete="new-password"
                className="pr-10"
                disabled={isPending}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <FieldError>{errors.password?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.role}>
            <FieldLabel
              htmlFor="user-role"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ShieldCheck className="size-4" /> Função{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="user-role" className="w-full">
                    <SelectValue placeholder="Selecione uma função" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.role?.message}</FieldError>
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: UserType
}

function EditDialog({ open, onOpenChange, user }: EditDialogProps) {
  const updateUser = useUpdateUser()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    setFocus,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
    },
  })

  useEffect(() => {
    if (open) {
      reset({ name: user.name, email: user.email, role: user.role })
      const id = window.setTimeout(() => setFocus("name"), 50)
      return () => window.clearTimeout(id)
    }
  }, [open, reset, setFocus, user])

  const isPending = updateUser.isPending

  async function onSubmit(data: UpdateUserFormData) {
    try {
      await updateUser.mutateAsync({ id: user.id, data })
      onOpenChange(false)
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 409) {
        setError("email", {
          type: "manual",
          message: "Já existe um usuário com esse e-mail.",
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar usuário</DialogTitle>
          <DialogDescription>
            Atualize os dados e o nível de acesso do usuário.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <Field data-invalid={!!errors.name}>
            <FieldLabel
              htmlFor="edit-user-name"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <User className="size-4" /> Nome{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="edit-user-name"
              autoComplete="off"
              disabled={isPending}
              {...register("name")}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.email}>
            <FieldLabel
              htmlFor="edit-user-email"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Mail className="size-4" /> E-mail{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="edit-user-email"
              type="email"
              autoComplete="off"
              disabled={isPending}
              {...register("email")}
            />
            <FieldError>{errors.email?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.role}>
            <FieldLabel
              htmlFor="edit-user-role"
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ShieldCheck className="size-4" /> Função{" "}
              <span className="text-destructive">*</span>
            </FieldLabel>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger id="edit-user-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <FieldError>{errors.role?.message}</FieldError>
          </Field>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
