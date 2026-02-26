import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { projectIdParamSchema, singleProjectResponseSchema } from '../schemas/project.schema.js'
import { uploadProjectImageController } from '../controllers/upload-project-image.controller.js'

export async function uploadProjectImageRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/projects/:id/image', {
    onRequest: [authJwt],
    schema: {
      tags: ['Projects'],
      summary: 'Upload project image to S3',
      security: [{ bearerAuth: [] }],
      params: projectIdParamSchema,
      response: { 200: singleProjectResponseSchema },
    },
    handler: uploadProjectImageController,
  })
}
