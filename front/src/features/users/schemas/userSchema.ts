import { z } from "zod"

export const userRoleSchema = z.enum(["ADMIN", "EDITOR", "USER"])

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
  role: userRoleSchema,
})

export const updateUserSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  role: userRoleSchema,
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
