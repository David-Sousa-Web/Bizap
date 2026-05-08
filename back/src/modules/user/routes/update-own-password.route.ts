import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { updateOwnPasswordController } from '../controllers/update-own-password.controller.js'
import {
  updateOwnPasswordBodySchema,
  updateOwnPasswordResponseSchema,
} from '../schemas/user.schema.js'

export async function updateOwnPasswordRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch('/users/me/password', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN, UserRole.EDITOR, UserRole.USER)],
    schema: {
      tags: ['Users'],
      summary: 'Update authenticated user password',
      security: [{ bearerAuth: [] }],
      body: updateOwnPasswordBodySchema,
      response: { 200: updateOwnPasswordResponseSchema },
    },
    handler: updateOwnPasswordController,
  })
}
