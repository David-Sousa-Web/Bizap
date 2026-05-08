import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { authJwt } from '../../../middlewares/auth-jwt.js'
import { paginationQuerySchema } from '../../../utils/pagination.js'
import { listUsersController } from '../controllers/list-users.controller.js'
import { listUsersResponseSchema } from '../schemas/user.schema.js'

export async function listUsersRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get('/users', {
    onRequest: [authJwt],
    schema: {
      tags: ['Users'],
      summary: 'List users',
      security: [{ bearerAuth: [] }],
      querystring: paginationQuerySchema,
      response: { 200: listUsersResponseSchema },
    },
    handler: listUsersController,
  })
}
