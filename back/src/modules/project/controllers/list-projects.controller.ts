import type { FastifyRequest, FastifyReply } from 'fastify'
import { listProjectsService } from '../services/list-projects.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'

export async function listProjectsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaProjectRepository()

  const projects = await listProjectsService(userId, repository)

  return reply.status(200).send({
    success: true,
    message: 'Projects retrieved successfully',
    data: projects,
  })
}
