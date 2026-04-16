import { z } from "zod"

export const addNumberSchema = z.object({
  name: z.string().trim().min(1, "Nome é obrigatório"),
  number: z
    .string()
    .trim()
    .regex(/^\+?\d{8,15}$/, "Use o formato E.164, ex: +5511999999999"),
})

export type AddNumberFormData = z.infer<typeof addNumberSchema>
