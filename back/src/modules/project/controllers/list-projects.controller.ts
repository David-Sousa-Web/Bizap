import type { FastifyRequest, FastifyReply } from 'fastify'
import { listProjectsService } from '../services/list-projects.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'
import type { PaginationQuery } from '../../../utils/pagination.js'

export async function listProjectsController(
  request: FastifyRequest<{ Querystring: PaginationQuery }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const { page, limit, search } = request.query
  const repository = new PrismaProjectRepository()

  const result = await listProjectsService(userId, page, limit, search, repository)

  return reply.status(200).send({
    success: true,
    message: 'Projects retrieved successfully',
    data: result.items,
    meta: result.meta,
  })
}
