import type { FastifyRequest, FastifyReply } from 'fastify'
import { createProjectService } from '../services/create-project.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'
import type { CreateProjectBody } from '../schemas/project.schema.js'

export async function createProjectController(
  request: FastifyRequest<{ Body: CreateProjectBody }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaProjectRepository()

  const project = await createProjectService(request.body, userId, repository)

  return reply.status(201).send({
    success: true,
    message: 'Project created successfully',
    data: project,
  })
}
