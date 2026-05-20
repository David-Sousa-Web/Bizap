import { z } from 'zod'

export const sendMediaParamsSchema = z.object({
  projectId: z.string().uuid(),
  bizapId: z.string().uuid(),
})

export const mediaRequestActionParamsSchema = z.object({
  projectId: z.string().uuid(),
  mediaRequestId: z.string().uuid(),
})

const mediaRequestResponseDataSchema = z.object({
  id: z.string(),
  mediaUrl: z.string(),
  status: z.string(),
  numberId: z.string(),
  projectId: z.string(),
})

export const sendMediaResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: mediaRequestResponseDataSchema,
})

export const mediaRequestActionResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: mediaRequestResponseDataSchema,
})

export type SendMediaParams = z.infer<typeof sendMediaParamsSchema>
export type MediaRequestActionParams = z.infer<typeof mediaRequestActionParamsSchema>
