import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authApiKey } from '../../../middlewares/auth-api-key.js'
import {
  sendMediaParamsSchema,
  sendMediaBodySchema,
  sendMediaResponseSchema,
} from '../schemas/media.schema.js'
import { sendMediaController } from '../controllers/send-media.controller.js'

export async function sendMediaRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/projects/:projectId/:bizapId/media', {
    onRequest: [authApiKey],
    schema: {
      tags: ['Media'],
      summary: 'Send media to a registered number (external app)',
      security: [{ apiKeyAuth: [] }],
      params: sendMediaParamsSchema,
      body: sendMediaBodySchema,
      response: { 201: sendMediaResponseSchema },
    },
    handler: sendMediaController,
  })
}
