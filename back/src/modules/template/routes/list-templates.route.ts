import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { paginationQuerySchema } from '../../../utils/pagination.js'
import { listTemplatesResponseSchema } from '../schemas/template.schema.js'
import { listTemplatesController } from '../controllers/list-templates.controller.js'

export async function listTemplatesRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/templates', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)],
    schema: {
      tags: ['Templates'],
      summary: 'List Twilio pre-approved templates',
      security: [{ bearerAuth: [] }],
      querystring: paginationQuerySchema,
      response: { 200: listTemplatesResponseSchema },
    },
    handler: listTemplatesController,
  })
}
