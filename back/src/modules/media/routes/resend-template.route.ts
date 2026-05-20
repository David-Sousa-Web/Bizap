import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import {
  mediaRequestActionParamsSchema,
  mediaRequestActionResponseSchema,
} from '../schemas/media.schema.js'
import { resendTemplateController } from '../controllers/resend-template.controller.js'

export async function resendTemplateRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/projects/:projectId/media-requests/:mediaRequestId/template/resend', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR)],
    schema: {
      tags: ['Media'],
      summary: 'Resend template for a failed media request',
      security: [{ bearerAuth: [] }],
      params: mediaRequestActionParamsSchema,
      response: { 200: mediaRequestActionResponseSchema },
    },
    handler: resendTemplateController,
  })
}
