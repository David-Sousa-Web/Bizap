import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { listNumbersService } from '../services/list-numbers.service.js'
import { PrismaNumberRepository } from '../repositories/prisma-number-repository.js'
import type { ListNumbersQuery } from '../schemas/number.schema.js'

export async function listNumbersController(
  request: FastifyRequest<{ Params: { projectId: string }; Querystring: ListNumbersQuery }>,
  reply: FastifyReply,
) {
  const repository = new PrismaNumberRepository()
  const observability = createObservabilityContext(request, {
    module: 'number',
    operation: 'list',
  })

  const result = await listNumbersService(
    request.params.projectId,
    request.query,
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
