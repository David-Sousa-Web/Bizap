import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { PrismaUserRepository } from '../repositories/prisma-user-repository.js'
import { getUserService } from '../services/get-user.service.js'

export async function getUserController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const repository = new PrismaUserRepository()
  const observability = createObservabilityContext(request, {
    module: 'user',
    operation: 'get',
  })

  const user = await getUserService(request.params.id, repository, observability)

  return reply.status(200).send({
    success: true,
    message: 'User retrieved successfully',
    data: user,
  })
}
