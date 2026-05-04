import { z } from "zod"

export const createProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  agency: z.string().optional(),
  templateSid: z.string().min(1, "Selecione um template"),
  flowMessage: z.string().min(1, "Mensagem de resposta é obrigatória"),
  zabbixHostName: z.string().optional(),
})

export type CreateProjectFormData = z.infer<typeof createProjectSchema>

export const basicDataSchema = createProjectSchema.pick({
  name: true,
  phoneNumber: true,
  agency: true,
  zabbixHostName: true,
})

export const templateSchema = createProjectSchema.pick({
  templateSid: true,
})

export const flowMessageSchema = createProjectSchema.pick({
  flowMessage: true,
})
