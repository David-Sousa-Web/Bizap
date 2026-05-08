import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { PrismaUserRepository } from '../repositories/prisma-user-repository.js'
import { deleteUserService } from '../services/delete-user.service.js'

export async function deleteUserController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaUserRepository()
  const observability = createObservabilityContext(request, {
    module: 'user',
    operation: 'delete',
  })

  await deleteUserService(request.params.id, userId, repository, observability)

  return reply.status(200).send({
    success: true,
    message: 'User deleted successfully',
    data: null,
  })
}
