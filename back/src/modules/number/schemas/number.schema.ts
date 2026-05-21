import { z } from 'zod'
import { paginationQuerySchema } from '../../../utils/pagination.js'

const BRAZIL_COUNTRY_CODE = '55'
const PHONE_ERROR_MESSAGE =
  'Number must be in format +55DDDNXXXXXXXX, 55DDDNXXXXXXXX or DDDNXXXXXXXX'

function normalizeBrazilPhoneNumber(value: string, ctx: z.RefinementCtx) {
  if (value.startsWith('+') && !value.startsWith(`+${BRAZIL_COUNTRY_CODE}`)) {
    ctx.addIssue({
      code: 'custom',
      message: PHONE_ERROR_MESSAGE,
    })

    return z.NEVER
  }

  const digits = value.replace(/\D/g, '')
  const nationalNumber = digits.startsWith(BRAZIL_COUNTRY_CODE)
    ? digits.slice(BRAZIL_COUNTRY_CODE.length)
    : digits

  if (!/^\d{11}$/.test(nationalNumber)) {
    ctx.addIssue({
      code: 'custom',
      message: PHONE_ERROR_MESSAGE,
    })

    return z.NEVER
  }

  return `+${BRAZIL_COUNTRY_CODE}${nationalNumber}`
}

export const createNumberBodySchema = z.object({
  name: z.string().trim().min(1),
  number: z
    .string()
    .trim()
    .transform((value, ctx) => normalizeBrazilPhoneNumber(value, ctx)),
})

export const numberProjectIdParamSchema = z.object({
  projectId: z.string().uuid(),
})

const mediaRequestStatusSchema = z.enum([
  'PENDING',
  'TEMPLATE_SENT',
  'RECONFIRMATION_SENT',
  'DECLINED',
  'CONFIRMED',
  'MEDIA_SENT',
  'INVALID_RESPONSE_LIMIT',
  'TEMPLATE_SEND_FAILED',
  'MEDIA_SEND_FAILED',
  'FAILED',
])

const dateQuerySchema = z.string().trim().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  { message: 'Invalid date' },
)

export const listNumbersQuerySchema = paginationQuerySchema.extend({
  id: z.string().uuid().optional(),
  name: z.string().trim().optional(),
  number: z.string().trim().optional(),
  lastMediaRequestStatus: z.union([mediaRequestStatusSchema, z.literal('NONE')]).optional(),
  hasMedia: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  createdAtFrom: dateQuerySchema.optional(),
  createdAtTo: dateQuerySchema.optional(),
  updatedAtFrom: dateQuerySchema.optional(),
  updatedAtTo: dateQuerySchema.optional(),
  sortBy: z
    .enum(['id', 'name', 'number', 'lastMediaRequestStatus', 'hasMedia', 'createdAt', 'updatedAt'])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

const numberResponseDataSchema = z.object({
  id: z.string(),
  name: z.string(),
  number: z.string(),
  projectId: z.string(),
  imageUrl: z.string().nullable(),
  lastMediaRequestStatus: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
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
  meta: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
})

export type CreateNumberBody = z.infer<typeof createNumberBodySchema>
export type ListNumbersQuery = z.infer<typeof listNumbersQuerySchema>
