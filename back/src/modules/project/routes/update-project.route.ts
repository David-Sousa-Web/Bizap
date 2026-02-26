import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import {
  projectIdParamSchema,
  updateProjectBodySchema,
  singleProjectResponseSchema,
} from '../schemas/project.schema.js'
import { updateProjectController } from '../controllers/update-project.controller.js'

export async function updateProjectRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/projects/:id', {
    onRequest: [authJwt],
    schema: {
      tags: ['Projects'],
      summary: 'Update a project',
      security: [{ bearerAuth: [] }],
      params: projectIdParamSchema,
      body: updateProjectBodySchema,
      response: { 200: singleProjectResponseSchema },
    },
    handler: updateProjectController,
  })
}
