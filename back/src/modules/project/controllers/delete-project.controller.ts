import type { FastifyRequest, FastifyReply } from 'fastify'
import { deleteProjectService } from '../services/delete-project.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'

export async function deleteProjectController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaProjectRepository()

  await deleteProjectService(request.params.id, userId, repository)

  return reply.status(200).send({
    success: true,
    message: 'Project deleted successfully',
    data: null,
  })
}
