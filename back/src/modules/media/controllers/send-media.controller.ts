import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext } from '../../../lib/wide-event.js'
import { sendMediaService } from '../services/send-media.service.js'
import { PrismaMediaRepository } from '../repositories/prisma-media-repository.js'
import type { SendMediaParams } from '../schemas/media.schema.js'
import { ApplicationError } from '../../../utils/errors.js'

export async function sendMediaController(
  request: FastifyRequest<{ Params: SendMediaParams }>,
  reply: FastifyReply,
) {
  const repository = new PrismaMediaRepository()
  const observability = createObservabilityContext(request, {
    module: 'media',
    operation: 'send',
  })
  const file = await request.file()

  if (!file || file.fieldname !== 'file') {
    throw new ApplicationError('Media file is required', 400)
  }

  const mediaRequest = await sendMediaService(
    request.params.projectId,
    request.params.bizapId,
    file,
    repository,
    observability,
  )

  return reply.status(201).send({
    success: true,
    message: 'Media request created and template sent',
    data: mediaRequest,
  })
}
