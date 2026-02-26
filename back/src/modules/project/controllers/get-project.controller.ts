import type { FastifyRequest, FastifyReply } from 'fastify'
import { getProjectService } from '../services/get-project.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'

export async function getProjectController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaProjectRepository()

  const project = await getProjectService(request.params.id, userId, repository)

  return reply.status(200).send({
    success: true,
    message: 'Project retrieved successfully',
    data: project,
  })
}
