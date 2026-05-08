import type { FastifyInstance } from 'fastify'
import { UserRole } from '@prisma/client'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { requireRole } from '../../../middlewares/require-role.js'
import { createUserController } from '../controllers/create-user.controller.js'
import { createUserBodySchema, singleUserResponseSchema } from '../schemas/user.schema.js'

export async function createUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/users', {
    onRequest: [authJwt, requireRole(UserRole.ADMIN)],
    schema: {
      tags: ['Users'],
      summary: 'Create a new user',
      security: [{ bearerAuth: [] }],
      body: createUserBodySchema,
      response: { 201: singleUserResponseSchema },
    },
    handler: createUserController,
  })
}
