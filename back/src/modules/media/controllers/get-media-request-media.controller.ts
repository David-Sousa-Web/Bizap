import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../../../lib/prisma.js'
import { getMediaStream } from '../../../lib/s3.js'
import {
  buildErrorCode,
  createObservabilityContext,
  pushIntegrationEvent,
  setErrorContext,
  setMediaContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { MediaRequestActionParams } from '../schemas/media.schema.js'

export async function getMediaRequestMediaController(
  request: FastifyRequest<{ Params: MediaRequestActionParams }>,
  reply: FastifyReply,
) {
  const observability = createObservabilityContext(request, {
    module: 'media',
    operation: 'get-media',
  })

  setProjectContext(observability.wideEvent, {
    projectId: request.params.projectId,
  })
  setMediaContext(observability.wideEvent, {
    mediaRequestId: request.params.mediaRequestId,
    storage: 's3',
  })

  const mediaRequest = await prisma.mediaRequest.findUnique({
    where: { id: request.params.mediaRequestId },
    select: {
      id: true,
      mediaUrl: true,
      projectId: true,
      status: true,
      project: {
        select: {
          name: true,
        },
      },
    },
  })

  if (!mediaRequest || mediaRequest.projectId !== request.params.projectId) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'media_request_not_found',
      message: 'Media request not found in this project',
    })

    throw new ApplicationError('Media request not found in this project', 404)
  }

  setProjectContext(observability.wideEvent, {
    projectId: mediaRequest.projectId,
    projectName: mediaRequest.project.name,
  })
  setMediaContext(observability.wideEvent, {
    mediaRequestId: mediaRequest.id,
    status: mediaRequest.status,
  })

  let stream
  const startedAt = Date.now()

  try {
    stream = await getMediaStream(mediaRequest.mediaUrl)
  } catch (error) {
    pushIntegrationEvent(observability.wideEvent, {
      provider: 's3',
      operation: 'get_media_request_media',
      outcome: 'error',
      durationMs: Date.now() - startedAt,
      code: buildErrorCode(error),
    })
    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'StorageError',
      code: 'media_request_media_fetch_failed',
      message: 'Failed to retrieve media',
    })

    throw new ApplicationError('Failed to retrieve media', 502)
  }

  pushIntegrationEvent(observability.wideEvent, {
    provider: 's3',
    operation: 'get_media_request_media',
    outcome: 'success',
    durationMs: Date.now() - startedAt,
  })

  reply.header('Content-Type', stream.contentType ?? 'application/octet-stream')
  reply.header('Cache-Control', 'private, max-age=300')

  if (stream.contentLength) {
    reply.header('Content-Length', stream.contentLength)
  }

  return reply.send(stream.body)
}
