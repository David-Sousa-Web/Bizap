import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authApiKey } from '../../../middlewares/auth-api-key.js'
import {
  numberProjectIdParamSchema,
  createNumberBodySchema,
  singleNumberResponseSchema,
} from '../schemas/number.schema.js'
import { createNumberController } from '../controllers/create-number.controller.js'

export async function createNumberRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/projects/:projectId/numbers', {
    onRequest: [authApiKey],
    schema: {
      tags: ['Numbers'],
      summary: 'Register a phone number (external app)',
      security: [{ apiKeyAuth: [] }],
      params: numberProjectIdParamSchema,
      body: createNumberBodySchema,
      response: { 201: singleNumberResponseSchema },
    },
    handler: createNumberController,
  })
}
