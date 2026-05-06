import { z } from "zod"

export const editProjectSchema = z.object({
  phoneNumber: z.string().trim().regex(/^\+\d{8,15}$/, "Número de telefone inválido"),
  agency: z.string().optional(),
})

export type EditProjectFormData = z.infer<typeof editProjectSchema>

export const zabbixIntegrationSchema = z.object({
  zabbixHostName: z.string().optional(),
})

export type ZabbixIntegrationFormData = z.infer<typeof zabbixIntegrationSchema>
