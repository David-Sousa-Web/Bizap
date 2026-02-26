import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import {
  projectIdAsProjectIdParamSchema,
  updateFlowMessageBodySchema,
  singleProjectResponseSchema,
} from '../schemas/project.schema.js'
import { updateFlowMessageController } from '../controllers/update-flow-message.controller.js'

export async function updateFlowMessageRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/projects/:projectId/response-message', {
    onRequest: [authJwt],
    schema: {
      tags: ['Projects'],
      summary: 'Update the flow message for a project',
      security: [{ bearerAuth: [] }],
      params: projectIdAsProjectIdParamSchema,
      body: updateFlowMessageBodySchema,
      response: { 200: singleProjectResponseSchema },
    },
    handler: updateFlowMessageController,
  })
}
