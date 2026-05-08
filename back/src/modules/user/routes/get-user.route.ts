import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { getUserController } from '../controllers/get-user.controller.js'
import { singleUserResponseSchema, userIdParamSchema } from '../schemas/user.schema.js'

export async function getUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/users/:id', {
    onRequest: [authJwt],
    schema: {
      tags: ['Users'],
      summary: 'Get user details',
      security: [{ bearerAuth: [] }],
      params: userIdParamSchema,
      response: { 200: singleUserResponseSchema },
    },
    handler: getUserController,
  })
}
