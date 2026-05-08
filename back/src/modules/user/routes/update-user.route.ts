import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { updateUserController } from '../controllers/update-user.controller.js'
import {
  singleUserResponseSchema,
  updateUserBodySchema,
  userIdParamSchema,
} from '../schemas/user.schema.js'

export async function updateUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().put('/users/:id', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN)],
    schema: {
      tags: ['Users'],
      summary: 'Update a user',
      security: [{ bearerAuth: [] }],
      params: userIdParamSchema,
      body: updateUserBodySchema,
      response: { 200: singleUserResponseSchema },
    },
    handler: updateUserController,
  })
}
