import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, KeyRound, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { useUpdateOwnPassword } from "@/features/users/hooks/useUpdateOwnPassword"
import {
  updatePasswordSchema,
  type UpdatePasswordFormData,
} from "@/features/users/schemas/passwordSchema"

const DEFAULT_VALUES: UpdatePasswordFormData = {
  currentPassword: "",
  newPassword: "",
  confirmNewPassword: "",
}

export function ChangePasswordForm() {
  const updatePassword = useUpdateOwnPassword()
  const [visibility, setVisibility] = useState({
    current: false,
    next: false,
    confirm: false,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: DEFAULT_VALUES,
  })

  const isPending = updatePassword.isPending

  function toggle(field: keyof typeof visibility) {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  async function onSubmit(data: UpdatePasswordFormData) {
    try {
      await updatePassword.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
      reset(DEFAULT_VALUES)
      setVisibility({ current: false, next: false, confirm: false })
    } catch {
      /* erro tratado pelo hook */
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5 max-w-xl"
      noValidate
    >
      <Field data-invalid={!!errors.currentPassword}>
        <FieldLabel
          htmlFor="current-password"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <KeyRound className="size-4" /> Senha atual{" "}
          <span className="text-destructive">*</span>
        </FieldLabel>
        <div className="relative">
          <Input
            id="current-password"
            type={visibility.current ? "text" : "password"}
            placeholder="••••••"
            autoComplete="current-password"
            className="pr-10"
            disabled={isPending}
            {...register("currentPassword")}
          />
          <PasswordToggle
            visible={visibility.current}
            onToggle={() => toggle("current")}
          />
        </div>
        <FieldError>{errors.currentPassword?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.newPassword}>
        <FieldLabel
          htmlFor="new-password"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <KeyRound className="size-4" /> Nova senha{" "}
          <span className="text-destructive">*</span>
        </FieldLabel>
        <div className="relative">
          <Input
            id="new-password"
            type={visibility.next ? "text" : "password"}
            placeholder="••••••"
            autoComplete="new-password"
            className="pr-10"
            disabled={isPending}
            {...register("newPassword")}
          />
          <PasswordToggle
            visible={visibility.next}
            onToggle={() => toggle("next")}
          />
        </div>
        <FieldError>{errors.newPassword?.message}</FieldError>
      </Field>

      <Field data-invalid={!!errors.confirmNewPassword}>
        <FieldLabel
          htmlFor="confirm-new-password"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <KeyRound className="size-4" /> Confirmar nova senha{" "}
          <span className="text-destructive">*</span>
        </FieldLabel>
        <div className="relative">
          <Input
            id="confirm-new-password"
            type={visibility.confirm ? "text" : "password"}
            placeholder="••••••"
            autoComplete="new-password"
            className="pr-10"
            disabled={isPending}
            {...register("confirmNewPassword")}
          />
          <PasswordToggle
            visible={visibility.confirm}
            onToggle={() => toggle("confirm")}
          />
        </div>
        <FieldError>{errors.confirmNewPassword?.message}</FieldError>
      </Field>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {isPending ? "Salvando..." : "Salvar nova senha"}
        </Button>
      </div>
    </form>
  )
}

interface PasswordToggleProps {
  visible: boolean
  onToggle: () => void
}

function PasswordToggle({ visible, onToggle }: PasswordToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
      tabIndex={-1}
      aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
    >
      {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  )
}
