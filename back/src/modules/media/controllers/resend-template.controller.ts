import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { PrismaMediaRepository } from '../repositories/prisma-media-repository.js'
import { resendTemplateService } from '../services/resend-template.service.js'
import type { MediaRequestActionParams } from '../schemas/media.schema.js'

export async function resendTemplateController(
  request: FastifyRequest<{ Params: MediaRequestActionParams }>,
  reply: FastifyReply,
) {
  const repository = new PrismaMediaRepository()
  const observability = createObservabilityContext(request, {
    module: 'media',
    operation: 'resend-template',
  })

  const mediaRequest = await resendTemplateService(
    request.params.projectId,
    request.params.mediaRequestId,
    repository,
    observability,
  )

  return reply.status(200).send({
    success: true,
    message: 'Template resent successfully',
    data: mediaRequest,
  })
}
