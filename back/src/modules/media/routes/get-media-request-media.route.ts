import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { mediaRequestActionParamsSchema } from '../schemas/media.schema.js'
import { getMediaRequestMediaController } from '../controllers/get-media-request-media.controller.js'

export async function getMediaRequestMediaRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/projects/:projectId/media-requests/:mediaRequestId/media', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)],
    schema: {
      tags: ['Media'],
      summary: 'Get media request media (proxy from S3)',
      security: [{ bearerAuth: [] }],
      params: mediaRequestActionParamsSchema,
    },
    handler: getMediaRequestMediaController,
  })
}
