import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { updateProjectService } from '../services/update-project.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'
import type { UpdateProjectBody } from '../schemas/project.schema.js'

export async function updateProjectController(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateProjectBody }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaProjectRepository()
  const observability = createObservabilityContext(request, {
    module: 'project',
    operation: 'update',
  })

  const project = await updateProjectService(
    request.params.id,
    userId,
    request.body,
    repository,
    observability,
  )

  return reply.status(200).send({
    success: true,
    message: 'Project updated successfully',
    data: project,
  })
}
