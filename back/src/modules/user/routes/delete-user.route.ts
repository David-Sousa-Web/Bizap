import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { deleteUserController } from '../controllers/delete-user.controller.js'
import { deleteUserResponseSchema, userIdParamSchema } from '../schemas/user.schema.js'

export async function deleteUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete('/users/:id', {
    onRequest: [authJwt],
    schema: {
      tags: ['Users'],
      summary: 'Delete a user',
      security: [{ bearerAuth: [] }],
      params: userIdParamSchema,
      response: { 200: deleteUserResponseSchema },
    },
    handler: deleteUserController,
  })
}
