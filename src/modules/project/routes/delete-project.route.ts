import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { projectIdParamSchema, deleteProjectResponseSchema } from '../schemas/project.schema.js'
import { deleteProjectController } from '../controllers/delete-project.controller.js'

export async function deleteProjectRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/projects/:id', {
    onRequest: [authJwt],
    schema: {
      tags: ['Projects'],
      summary: 'Delete a project',
      security: [{ bearerAuth: [] }],
      params: projectIdParamSchema,
      response: { 200: deleteProjectResponseSchema },
    },
    handler: deleteProjectController,
  })
}
