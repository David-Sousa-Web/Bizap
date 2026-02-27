import { z } from 'zod'

export const createNumberBodySchema = z.object({
  name: z.string().min(1),
  number: z.string().min(1),
})

export const numberProjectIdParamSchema = z.object({
  projectId: z.string().uuid(),
})

const numberResponseDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  projectId: z.string(),
})

export const singleNumberResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: numberResponseDataSchema,
})

export const listNumbersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(numberResponseDataSchema),
})

export type CreateNumberBody = z.infer<typeof createNumberBodySchema>
