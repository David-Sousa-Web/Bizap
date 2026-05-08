import type { FastifyReply, FastifyRequest } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import type { PaginationQuery } from '../../../utils/pagination.js'
import { PrismaUserRepository } from '../repositories/prisma-user-repository.js'
import { listUsersService } from '../services/list-users.service.js'

export async function listUsersController(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) {
  const { page, limit, search } = request.query
  const repository = new PrismaUserRepository()
  const observability = createObservabilityContext(request, {
    module: 'user',
    operation: 'list',
  })

  const result = await listUsersService(page, limit, search, repository, observability)

  return reply.status(200).send({
    success: true,
    message: 'Users retrieved successfully',
    data: result.items,
    meta: result.meta,
  })
}
