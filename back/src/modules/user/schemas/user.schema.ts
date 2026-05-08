import { z } from 'zod'
import { paginationMetaSchema } from '../../../utils/pagination.js'

export const userRoleSchema = z.enum(['ADMIN', 'EDITOR', 'USER'])

export const createUserBodySchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: userRoleSchema.optional(),
})

export const updateUserBodySchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().email().optional(),
  role: userRoleSchema.optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
})

export const updateOwnPasswordBodySchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
})

export const userIdParamSchema = z.object({
  id: z.string().uuid(),
})

const userResponseDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  role: userRoleSchema,
})

export const singleUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: userResponseDataSchema,
})

export const listUsersResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.array(userResponseDataSchema),
  meta: paginationMetaSchema,
})

export const deleteUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.null(),
})

export const updateOwnPasswordResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.null(),
})

export type CreateUserBody = z.infer<typeof createUserBodySchema>
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>
export type UpdateOwnPasswordBody = z.infer<typeof updateOwnPasswordBodySchema>
