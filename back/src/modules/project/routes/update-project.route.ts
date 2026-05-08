import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import {
  projectIdParamSchema,
  updateProjectBodySchema,
  singleProjectResponseSchema,
} from '../schemas/project.schema.js'
import { updateProjectController } from '../controllers/update-project.controller.js'

export async function updateProjectRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/projects/:id', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR)],
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
