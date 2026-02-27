import { z } from 'zod'

const templateDataSchema = z.object({
  sid: z.string(),
  name: z.string(),
  type: z.string(),
  body: z.any(),
  whatsappStatus: z.string(),
  businessInitiated: z.boolean(),
  userInitiated: z.boolean(),
})

export const listTemplatesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(templateDataSchema),
})
