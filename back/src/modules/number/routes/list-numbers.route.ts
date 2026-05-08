import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { paginationQuerySchema } from '../../../utils/pagination.js'
import { numberProjectIdParamSchema, listNumbersResponseSchema } from '../schemas/number.schema.js'
import { listNumbersController } from '../controllers/list-numbers.controller.js'

export async function listNumbersRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/projects/:projectId/numbers', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)],
    schema: {
      tags: ['Numbers'],
      summary: 'List registered numbers for a project',
      security: [{ bearerAuth: [] }],
      params: numberProjectIdParamSchema,
      querystring: paginationQuerySchema,
      response: { 200: listNumbersResponseSchema },
    },
    handler: listNumbersController,
  })
}
