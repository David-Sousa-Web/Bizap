import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import {
  mediaRequestActionParamsSchema,
  mediaRequestActionResponseSchema,
} from '../schemas/media.schema.js'
import { sendMediaRequestMediaController } from '../controllers/send-media-request-media.controller.js'

export async function sendMediaRequestMediaRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/projects/:projectId/media-requests/:mediaRequestId/media/send', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR)],
    schema: {
      tags: ['Media'],
      summary: 'Send media directly for a media request',
      security: [{ bearerAuth: [] }],
      params: mediaRequestActionParamsSchema,
      response: { 200: mediaRequestActionResponseSchema },
    },
    handler: sendMediaRequestMediaController,
  })
}
