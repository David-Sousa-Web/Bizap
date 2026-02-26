import { z } from 'zod'

export const sendMediaBodySchema = z.object({
  mediaUrl: z.string().url(),
})

export const sendMediaParamsSchema = z.object({
  projectId: z.string().uuid(),
  bizapId: z.string().uuid(),
})

export const sendMediaResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.string(),
    mediaUrl: z.string(),
    status: z.string(),
    numberId: z.string(),
    projectId: z.string(),
    createdAt: z.string(),
  }).nullable(),
})

export type SendMediaBody = z.infer<typeof sendMediaBodySchema>
export type SendMediaParams = z.infer<typeof sendMediaParamsSchema>
