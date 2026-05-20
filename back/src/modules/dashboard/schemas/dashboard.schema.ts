import { z } from 'zod'

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

const mediaStatusCountsSchema = z.object({
  PENDING: z.number(),
  TEMPLATE_SENT: z.number(),
  RECONFIRMATION_SENT: z.number(),
  DECLINED: z.number(),
  CONFIRMED: z.number(),
  MEDIA_SENT: z.number(),
  INVALID_RESPONSE_LIMIT: z.number(),
  TEMPLATE_SEND_FAILED: z.number(),
  MEDIA_SEND_FAILED: z.number(),
  FAILED: z.number(),
})

export const dashboardQuerySchema = z.object({
  projectId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
})

export const dashboardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    filters: z.object({
      projectId: z.string().nullable(),
      from: z.string().nullable(),
      to: z.string().nullable(),
    }),
    summary: z.object({
      totalProjects: z.number(),
      totalNumbers: z.number(),
      totalMediaRequests: z.number(),
      totalDeliveredMedia: z.number(),
      totalFailed: z.number(),
      confirmationRate: z.number(),
      deliveryRate: z.number(),
    }),
    mediaStatus: mediaStatusCountsSchema,
    replyMetrics: z.object({
      templateSent: z.number(),
      yesReply: z.number(),
      noReply: z.number(),
      invalidReply: z.number(),
      mediaSent: z.number(),
    }),
    projects: z.array(z.object({
      id: z.string(),
      name: z.string(),
      image: z.string().nullable(),
      agency: z.string().nullable(),
      totalNumbers: z.number(),
      totalMediaRequests: z.number(),
      deliveredMedia: z.number(),
      failed: z.number(),
      confirmationRate: z.number(),
    })),
    recentActivity: z.array(z.object({
      id: z.string(),
      projectId: z.string(),
      projectName: z.string(),
      numberId: z.string(),
      status: mediaRequestStatusSchema,
      createdAt: z.string(),
      updatedAt: z.string(),
    })),
    attention: z.object({
      pendingRequests: z.number(),
      declinedRequests: z.number(),
      invalidResponseLimit: z.number(),
      failedRequests: z.number(),
      projectsWithoutZabbixHost: z.number(),
    }),
  }),
})

export type DashboardQuery = z.infer<typeof dashboardQuerySchema>
