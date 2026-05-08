import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import type { UpdateUserBody } from '../schemas/user.schema.js'
import { PrismaUserRepository } from '../repositories/prisma-user-repository.js'
import { updateUserService } from '../services/update-user.service.js'

export async function updateUserController(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserBody }>,
  reply: FastifyReply,
) {
  const repository = new PrismaUserRepository()
  const observability = createObservabilityContext(request, {
    module: 'user',
    operation: 'update',
  })

  const user = await updateUserService(
    request.params.id,
    request.body,
    repository,
    observability,
  )

  return reply.status(200).send({
    success: true,
    message: 'User updated successfully',
    data: user,
  })
}
