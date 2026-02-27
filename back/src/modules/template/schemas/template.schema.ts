import { z } from 'zod'

const templateDataSchema = z.object({
  name: z.string(),
  status: z.string(),
  body: z.string(),
  type: z.string(),
})

export const listTemplatesResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(templateDataSchema),
})
