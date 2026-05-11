import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { paginationQuerySchema } from '../../../utils/pagination.js'
import { listProjectsResponseSchema } from '../schemas/project.schema.js'
import { listProjectsController } from '../controllers/list-projects.controller.js'

export async function listProjectsRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/projects', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)],
    schema: {
      tags: ['Projects'],
      summary: 'List all projects in the platform',
      security: [{ bearerAuth: [] }],
      querystring: paginationQuerySchema,
      response: { 200: listProjectsResponseSchema },
    },
    handler: listProjectsController,
  })
}
