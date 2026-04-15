import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { updateFlowMessageService } from '../services/update-flow-message.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'
import type { UpdateFlowMessageBody } from '../schemas/project.schema.js'

export async function updateFlowMessageController(
  request: FastifyRequest<{ Params: { projectId: string }; Body: UpdateFlowMessageBody }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaProjectRepository()
  const observability = createObservabilityContext(request, {
    module: 'project',
    operation: 'update-flow-message',
  })

  const project = await updateFlowMessageService(
    request.params.projectId,
    userId,
    request.body.flowMessage,
    repository,
    observability,
  )

  return reply.status(200).send({
    success: true,
    message: 'Flow message updated successfully',
    data: project,
  })
}
