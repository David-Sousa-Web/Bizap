import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { loginBodySchema, loginResponseSchema } from '../schemas/auth.schema.js'
import { loginController } from '../controllers/login.controller.js'

export async function loginRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post('/auth/login', {
    schema: {
      tags: ['Auth'],
      summary: 'User login',
      body: loginBodySchema,
      response: { 200: loginResponseSchema },
    },
    handler: loginController,
  })
}
