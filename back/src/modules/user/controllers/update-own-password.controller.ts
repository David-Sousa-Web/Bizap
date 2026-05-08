import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import type { UpdateOwnPasswordBody } from '../schemas/user.schema.js'
import { PrismaUserRepository } from '../repositories/prisma-user-repository.js'
import { updateOwnPasswordService } from '../services/update-own-password.service.js'

export async function updateOwnPasswordController(
  request: FastifyRequest<{ Body: UpdateOwnPasswordBody }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaUserRepository()
  const observability = createObservabilityContext(request, {
    module: 'user',
    operation: 'update-password',
  })

  await updateOwnPasswordService(userId, request.body, repository, observability)

  return reply.status(200).send({
    success: true,
    message: 'Password updated successfully',
    data: null,
  })
}
