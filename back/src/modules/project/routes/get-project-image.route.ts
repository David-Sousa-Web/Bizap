import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { projectIdParamSchema } from '../schemas/project.schema.js'
import { getProjectImageController } from '../controllers/get-project-image.controller.js'

export async function getProjectImageRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/projects/:id/image', {
    schema: {
      tags: ['Projects'],
      summary: 'Get project image (proxy from S3)',
      params: projectIdParamSchema,
    },
    handler: getProjectImageController,
  })
}
