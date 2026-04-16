import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Phone, User } from "lucide-react"
import { toast } from "sonner"
import axios from "axios"

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

import { useCreateNumber } from "@/features/projects/hooks/useCreateNumber"
import {
  addNumberSchema,
  type AddNumberFormData,
} from "@/features/projects/schemas/addNumberSchema"

interface AddNumberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  apiKey: string
}

export function AddNumberDialog({
  open,
  onOpenChange,
  projectId,
  apiKey,
}: AddNumberDialogProps) {
  const createNumber = useCreateNumber()

  const {
    register,
    handleSubmit,
    reset,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<AddNumberFormData>({
    resolver: zodResolver(addNumberSchema),
    defaultValues: { name: "", number: "" },
  })

  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => setFocus("name"), 50)
      return () => window.clearTimeout(id)
    }
    reset()
  }, [open, reset, setFocus])

  async function onSubmit(data: AddNumberFormData) {
    try {
      await createNumber.mutateAsync({
        projectId,
        apiKey,
        payload: data,
      })
      toast.success("Número adicionado com sucesso!")
      reset()
      onOpenChange(false)
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : undefined
      toast.error(message ?? "Não foi possível adicionar o número. Tente novamente.")
    }
  }

  const isPending = createNumber.isPending || isSubmitting

  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar número</DialogTitle>
          <DialogDescription>
            Cadastre manualmente um contato para que o projeto possa interagir com ele pelo WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5"
          noValidate
        >
          <Field data-invalid={!!errors.name} className="space-y-2">
            <FieldLabel htmlFor="number-name" className="flex items-center gap-2 text-sm font-medium">
              <User className="size-4" /> Nome <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="number-name"
              placeholder="Ex: João Silva"
              autoComplete="off"
              disabled={isPending}
              {...register("name")}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </Field>

          <Field data-invalid={!!errors.number} className="space-y-2">
            <FieldLabel htmlFor="number-phone" className="flex items-center gap-2 text-sm font-medium">
              <Phone className="size-4" /> Número <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="number-phone"
              placeholder="+5511999999999"
              inputMode="tel"
              autoComplete="off"
              disabled={isPending}
              {...register("number")}
            />
            <FieldError>{errors.number?.message}</FieldError>
            <p className="text-xs text-muted-foreground">
              Use o formato internacional E.164 (DDI + DDD + número), somente dígitos.
            </p>
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
              {isPending && <Loader2 className="size-4 animate-spin" />}
              Adicionar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
