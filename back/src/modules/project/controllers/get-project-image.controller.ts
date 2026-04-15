import type { FastifyRequest, FastifyReply } from 'fastify'
import { getProjectImageStream } from '../../../lib/s3.js'
import {
  buildErrorCode,
  createObservabilityContext,
  pushIntegrationEvent,
  setErrorContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import { PrismaProjectRepository } from '../repositories/prisma-project-repository.js'
import { ApplicationError } from '../../../utils/errors.js'

export async function getProjectImageController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply,
) {
  const repository = new PrismaProjectRepository()
  const observability = createObservabilityContext(request, {
    module: 'project',
    operation: 'get-image',
  })
  const project = await repository.findById(request.params.id)

  if (!project || !project.image) {
    setProjectContext(observability.wideEvent, {
      projectId: request.params.id,
    })
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_image_not_found',
      message: 'Image not found',
    })

    throw new ApplicationError('Image not found', 404)
  }

  setProjectContext(observability.wideEvent, {
    projectId: project.id,
    projectName: project.name,
  })

  let stream
  const startedAt = Date.now()

  try {
    stream = await getProjectImageStream(project.image)
  } catch (error) {
    pushIntegrationEvent(observability.wideEvent, {
      provider: 's3',
      operation: 'get_project_image',
      outcome: 'error',
      durationMs: Date.now() - startedAt,
      code: buildErrorCode(error),
    })
    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'StorageError',
      code: 'project_image_fetch_failed',
      message: 'Failed to retrieve image',
    })

    throw new ApplicationError('Failed to retrieve image', 502)
  }

  pushIntegrationEvent(observability.wideEvent, {
    provider: 's3',
    operation: 'get_project_image',
    outcome: 'success',
    durationMs: Date.now() - startedAt,
  })

  reply.header('Content-Type', stream.contentType ?? 'application/octet-stream')
  reply.header('Cache-Control', 'public, max-age=3600, stale-while-revalidate=3600')

  if (stream.contentLength) {
    reply.header('Content-Length', stream.contentLength)
  }

  return reply.send(stream.body)
}
