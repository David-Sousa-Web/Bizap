import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import type { CreateUserBody } from '../schemas/user.schema.js'
import { PrismaUserRepository } from '../repositories/prisma-user-repository.js'
import { createUserService } from '../services/create-user.service.js'

export async function createUserController(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply,
) {
  const repository = new PrismaUserRepository()
  const observability = createObservabilityContext(request, {
    module: 'user',
    operation: 'create',
  })

  const user = await createUserService(request.body, repository, observability)

  return reply.status(201).send({
    success: true,
    message: 'User created successfully',
    data: user,
  })
}
