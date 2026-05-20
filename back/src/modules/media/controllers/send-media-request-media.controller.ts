import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { PrismaMediaRepository } from '../repositories/prisma-media-repository.js'
import type { MediaRequestActionParams } from '../schemas/media.schema.js'
import { sendMediaRequestMediaService } from '../services/send-media-request-media.service.js'

export async function sendMediaRequestMediaController(
  request: FastifyRequest<{ Params: MediaRequestActionParams }>,
  reply: FastifyReply,
) {
  const repository = new PrismaMediaRepository()
  const observability = createObservabilityContext(request, {
    module: 'media',
    operation: 'send-media-direct',
  })

  const mediaRequest = await sendMediaRequestMediaService(
    request.params.projectId,
    request.params.mediaRequestId,
    repository,
    observability,
  )

  return reply.status(200).send({
    success: true,
    message: 'Media sent successfully',
    data: mediaRequest,
  })
}
