import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { projectIdParamSchema, singleProjectResponseSchema } from '../schemas/project.schema.js'
import { getProjectController } from '../controllers/get-project.controller.js'

export async function getProjectRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/projects/:id', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)],
    schema: {
      tags: ['Projects'],
      summary: 'Get project details',
      security: [{ bearerAuth: [] }],
      params: projectIdParamSchema,
      response: { 200: singleProjectResponseSchema },
    },
    handler: getProjectController,
  })
}
