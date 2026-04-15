import type { FastifyRequest, FastifyReply } from 'fastify'
import { getProjectImageStream } from '../../../lib/s3.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'
import { ApplicationError } from '../../../utils/errors.js'

export async function getProjectImageController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const repository = new PrismaProjectRepository()
  const project = await repository.findById(request.params.id)

  if (!project || !project.image) {
    throw new ApplicationError('Image not found', 404)
  }

  let stream
  try {
    stream = await getProjectImageStream(project.image)
  } catch {
    throw new ApplicationError('Failed to retrieve image', 502)
  }

  reply.header('Content-Type', stream.contentType ?? 'application/octet-stream')
  reply.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=3600')

  if (stream.contentLength) {
    reply.header('Content-Length', stream.contentLength)
  }

  return reply.send(stream.body)
}
