import { z } from "zod"

export const editProjectSchema = z.object({
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  agency: z.string().optional(),
})

export type EditProjectFormData = z.infer<typeof editProjectSchema>

export const zabbixIntegrationSchema = z.object({
  zabbixHostName: z.string().optional(),
})

export type ZabbixIntegrationFormData = z.infer<typeof zabbixIntegrationSchema>
