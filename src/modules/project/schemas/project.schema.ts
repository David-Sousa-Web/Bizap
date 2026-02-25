import { z } from 'zod'

export const createProjectBodySchema = z.object({
  name: z.string().min(1),
  phoneNumber: z.string().min(1),
  agency: z.string().optional(),
  templateSid: z.string().min(1),
  flowMessage: z.string().min(1),
})

export const updateProjectBodySchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().min(1).optional(),
  agency: z.string().optional(),
  templateSid: z.string().min(1).optional(),
})

export const updateFlowMessageBodySchema = z.object({
  flowMessage: z.string().min(1),
})

export const projectIdParamSchema = z.object({
  id: z.string().uuid(),
})

export const projectIdAsProjectIdParamSchema = z.object({
  projectId: z.string().uuid(),
})

const projectResponseDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string().nullable(),
  phoneNumber: z.string(),
  agency: z.string().nullable(),
  templateSid: z.string(),
  flowMessage: z.string(),
  apiKey: z.string(),
  createdAt: z.string(),
})

export const singleProjectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: projectResponseDataSchema.nullable(),
})

export const listProjectsResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(projectResponseDataSchema).nullable(),
})

export const deleteProjectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.null(),
})

export type CreateProjectBody = z.infer<typeof createProjectBodySchema>
export type UpdateProjectBody = z.infer<typeof updateProjectBodySchema>
export type UpdateFlowMessageBody = z.infer<typeof updateFlowMessageBodySchema>
