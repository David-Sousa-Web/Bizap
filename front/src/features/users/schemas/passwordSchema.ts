import { z } from "zod"

export const updatePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "A senha atual deve ter no mínimo 6 caracteres"),
    newPassword: z
      .string()
      .min(6, "A nova senha deve ter no mínimo 6 caracteres"),
    confirmNewPassword: z
      .string()
      .min(6, "A confirmação deve ter no mínimo 6 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "A nova senha deve ser diferente da senha atual",
    path: ["newPassword"],
  })

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>
