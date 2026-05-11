import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { getDashboardController } from '../controllers/get-dashboard.controller.js'
import { dashboardQuerySchema, dashboardResponseSchema } from '../schemas/dashboard.schema.js'

export async function getDashboardRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/dashboard', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)],
    schema: {
      tags: ['Dashboard'],
      summary: 'Get dashboard metrics for the platform',
      security: [{ bearerAuth: [] }],
      querystring: dashboardQuerySchema,
      response: { 200: dashboardResponseSchema },
    },
    handler: getDashboardController,
  })
}
