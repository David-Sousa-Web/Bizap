import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { createProjectBodySchema, singleProjectResponseSchema } from '../schemas/project.schema.js'
import { createProjectController } from '../controllers/create-project.controller.js'

export async function createProjectRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/projects', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR)],
    schema: {
      tags: ['Projects'],
      summary: 'Create a new project',
      security: [{ bearerAuth: [] }],
      body: createProjectBodySchema,
      response: { 201: singleProjectResponseSchema },
    },
    handler: createProjectController,
  })
}
