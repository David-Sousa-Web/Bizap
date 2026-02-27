import type { FastifyRequest, FastifyReply } from 'fastify'
import { listTemplatesService } from '../services/list-templates.service.js'
import type { PaginationQuery } from '../../../utils/pagination.js'

export async function listTemplatesController(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) {
  const { page, limit, search } = request.query

  const result = await listTemplatesService(page, limit, search)

  return reply.status(200).send({
    success: true,
    message: 'Templates retrieved successfully',
    data: result.items,
    meta: result.meta,
  })
}
