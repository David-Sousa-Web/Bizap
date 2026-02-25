import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendMediaService } from '../services/send-media.service.js'
import { PrismaMediaRepository } from '../repositories/prisma-media-repository.js'
import type { SendMediaBody, SendMediaParams } from '../schemas/media.schema.js'

export async function sendMediaController(
  request: FastifyRequest<{ Params: SendMediaParams; Body: SendMediaBody }>,
  reply: FastifyReply,
) {
  const repository = new PrismaMediaRepository()

  const mediaRequest = await sendMediaService(
    request.params.projectId,
    request.params.bizapId,
    request.body.mediaUrl,
    repository,
  )

  return reply.status(201).send({
    success: true,
    message: 'Media request created and template sent',
    data: mediaRequest,
  })
}
