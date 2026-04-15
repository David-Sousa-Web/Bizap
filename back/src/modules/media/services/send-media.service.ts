import { randomUUID } from 'node:crypto'
import { Upload } from '@aws-sdk/lib-storage'
import type { MultipartFile } from '@fastify/multipart'
import { s3Client } from '../../../lib/s3.js'
import { ApplicationError } from '../../../utils/errors.js'
import { twilioClient } from '../../../lib/twilio.js'
import { env } from '../../../env.js'
import { prisma } from '../../../lib/prisma.js'
import {
  buildErrorCode,
  maskActorPhone,
  type ObservabilityContext,
  pushIntegrationEvent,
  setErrorContext,
  setMediaContext,
  setNumberContext,
  setProjectContext,
  summarizeFileUpload,
} from '../../../lib/wide-event.js'
import type { MediaRepository } from '../repositories/media-repository.js'

export async function sendMediaService(
  projectId: string,
  bizapId: string,
  file: MultipartFile,
  repository: MediaRepository,
  observability: ObservabilityContext,
) {
  const fileSummary = summarizeFileUpload(file)

  setProjectContext(observability.wideEvent, {
    projectId,
  })
  setNumberContext(observability.wideEvent, {
    bizapId,
  })
  setMediaContext(observability.wideEvent, {
    mimeType: fileSummary.mimeType,
    sizeBytes: fileSummary.sizeBytes,
    storage: 's3',
  })

  const number = await prisma.number.findUnique({
    where: { id: bizapId },
  })

  if (!number || number.projectId !== projectId) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'number_not_found',
      message: 'Number not found in this project',
    })

    throw new ApplicationError('Number not found in this project', 404)
  }

  setNumberContext(observability.wideEvent, {
    bizapId: number.id,
    numberMasked: maskActorPhone(number.number),
    numberName: number.name,
  })

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found',
    })

    throw new ApplicationError('Project not found', 404)
  }

  setProjectContext(observability.wideEvent, {
    projectId: project.id,
    projectName: project.name,
    phoneNumberMasked: maskActorPhone(project.phoneNumber),
  })

  const extension = file.filename.split('.').pop()?.toLowerCase() ?? 'bin'
  const key = `bizap-media/${project.slug}/${randomUUID()}.${extension}`

  const upload = new Upload({
    client: s3Client,
    params: {
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: file.file,
      ContentType: file.mimetype,
    },
  })

  const s3StartedAt = Date.now()

  try {
    await upload.done()
  } catch (error) {
    pushIntegrationEvent(observability.wideEvent, {
      provider: 's3',
      operation: 'upload_media',
      outcome: 'error',
      durationMs: Date.now() - s3StartedAt,
      code: buildErrorCode(error),
    })
    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'StorageError',
      code: 'media_upload_failed',
      message: 'Failed to upload media',
    })

    throw new ApplicationError('Failed to upload media', 502)
  }

  const mediaUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

  pushIntegrationEvent(observability.wideEvent, {
    provider: 's3',
    operation: 'upload_media',
    outcome: 'success',
    durationMs: Date.now() - s3StartedAt,
  })

  const mediaRequest = await repository.create({
    mediaUrl,
    numberId: bizapId,
    projectId,
  })

  setMediaContext(observability.wideEvent, {
    mediaRequestId: mediaRequest.id,
    status: mediaRequest.status,
  })

  const twilioStartedAt = Date.now()
  try {
    await twilioClient.messages.create({
      from: `whatsapp:${project.phoneNumber}`,
      to: `whatsapp:${number.number}`,
      contentSid: project.templateSid,
    })

    await repository.updateStatus(mediaRequest.id, 'TEMPLATE_SENT')
    pushIntegrationEvent(observability.wideEvent, {
      provider: 'twilio',
      operation: 'send_template',
      outcome: 'success',
      durationMs: Date.now() - twilioStartedAt,
    })
    setMediaContext(observability.wideEvent, {
      status: 'TEMPLATE_SENT',
    })
  } catch (error) {
    await repository.updateStatus(mediaRequest.id, 'FAILED')
    pushIntegrationEvent(observability.wideEvent, {
      provider: 'twilio',
      operation: 'send_template',
      outcome: 'error',
      durationMs: Date.now() - twilioStartedAt,
      code: buildErrorCode(error),
    })
    setMediaContext(observability.wideEvent, {
      status: 'FAILED',
    })
    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'ExternalServiceError',
      code: 'twilio_template_send_failed',
      message: 'Failed to send template via Twilio',
    })
    throw new ApplicationError('Failed to send template via Twilio', 502)
  }

  return {
    id: mediaRequest.id,
    mediaUrl: mediaRequest.mediaUrl,
    status: 'TEMPLATE_SENT',
    numberId: mediaRequest.numberId,
    projectId: mediaRequest.projectId,
  }
}
