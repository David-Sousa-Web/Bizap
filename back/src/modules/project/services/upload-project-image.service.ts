import { randomUUID } from 'node:crypto'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client } from '../../../lib/s3.js'
import { env } from '../../../env.js'
import { ApplicationError } from '../../../utils/errors.js'
import {
  buildErrorCode,
  type ObservabilityContext,
  pushIntegrationEvent,
  setErrorContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import type { MultipartFile } from '@fastify/multipart'
import { transformImageUrl } from '../utils/transform-image-url.js'

export async function uploadProjectImageService(
  projectId: string,
  userId: string,
  file: MultipartFile,
  repository: ProjectRepository,
  observability: ObservabilityContext,
) {
  setProjectContext(observability.wideEvent, {
    projectId,
  })

  const project = await repository.findById(projectId)

  if (!project) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found',
    })

    throw new ApplicationError('Project not found', 404)
  }

  if (project.userId !== userId) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found',
    })

    throw new ApplicationError('Project not found', 404)
  }

  const extension = file.filename.split('.').pop() ?? 'png'
  const key = `bizap-projects/${projectId}/${randomUUID()}.${extension}`

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file.file,
      ContentType: file.mimetype,
    },
  })

  const startedAt = Date.now()

  try {
    await upload.done()
  } catch (error) {
    pushIntegrationEvent(observability.wideEvent, {
      provider: 's3',
      operation: 'upload_project_image',
      outcome: 'error',
      durationMs: Date.now() - startedAt,
      code: buildErrorCode(error),
    })
    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'StorageError',
      code: 'project_image_upload_failed',
      message: 'Failed to upload image',
    })

    throw new ApplicationError('Failed to upload image', 502)
  }

  const imageUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

  pushIntegrationEvent(observability.wideEvent, {
    provider: 's3',
    operation: 'upload_project_image',
    outcome: 'success',
    durationMs: Date.now() - startedAt,
  })

  const updated = await repository.update(projectId, { image: imageUrl })
  setProjectContext(observability.wideEvent, {
    projectId: updated.id,
    projectName: updated.name,
  })

  return {
    id: updated.id,
    name: updated.name,
    image: transformImageUrl(updated.image, updated.id, env.API_BASE_URL),
    phoneNumber: updated.phoneNumber,
    agency: updated.agency,
    templateSid: updated.templateSid,
    flowMessage: updated.flowMessage,
    apiKey: updated.apiKey,
  }
}
