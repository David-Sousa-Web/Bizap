import type { FastifyRequest, FastifyReply } from 'fastify'
import { uploadProjectImageService } from '../services/upload-project-image.service.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'
import { ApplicationError } from '../../../utils/errors.js'

export async function uploadProjectImageController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const userId = (request.user as { sub: string }).sub
  const repository = new PrismaProjectRepository()

  const file = await request.file()

  if (!file) {
    throw new ApplicationError('Image file is required', 400)
  }

  const project = await uploadProjectImageService(
    request.params.id,
    userId,
    file,
    repository,
  )

  return reply.status(200).send({
    success: true,
    message: 'Project image uploaded successfully',
    data: project,
  })
}
