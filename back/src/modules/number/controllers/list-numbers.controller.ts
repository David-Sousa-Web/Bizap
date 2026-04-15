import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { listNumbersService } from '../services/list-numbers.service.js'
import { PrismaNumberRepository } from '../repositories/prisma-number-repository.js'
import type { PaginationQuery } from '../../../utils/pagination.js'

export async function listNumbersController(
  request: FastifyRequest<{ Params: { projectId: string }; Querystring: PaginationQuery }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const { page, limit, search } = request.query
  const repository = new PrismaNumberRepository()
  const observability = createObservabilityContext(request, {
    module: 'number',
    operation: 'list',
  })

  const result = await listNumbersService(
    request.params.projectId,
    userId,
    page,
    limit,
    search,
    repository,
    observability,
  )

  return reply.status(200).send({
    success: true,
    message: 'Numbers retrieved successfully',
    data: result.items,
    meta: result.meta,
  })
}
