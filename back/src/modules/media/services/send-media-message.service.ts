import type { MediaRequest, Project } from '@prisma/client'
import { getPresignedMediaUrl } from '../../../lib/s3.js'
import { twilioClient } from '../../../lib/twilio.js'
import {
  buildErrorCode,
  type ObservabilityContext,
  pushIntegrationEvent,
  setErrorContext,
  setMediaContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import { recordZabbixMetricEvent } from '../../metrics/services/record-zabbix-metric-event.js'
import type { MediaRepository } from '../repositories/media-repository.js'

type SendMediaMessageInput = {
  mediaRequest: MediaRequest
  project: Project
  to: string
  repository: MediaRepository
  observability: ObservabilityContext
  operation: string
}

function toWhatsappAddress(phoneNumber: string) {
  return phoneNumber.startsWith('whatsapp:') ? phoneNumber : `whatsapp:${phoneNumber}`
}

export async function sendMediaMessage({
  mediaRequest,
  project,
  to,
  repository,
  observability,
  operation,
}: SendMediaMessageInput): Promise<MediaRequest> {
  try {
    const presignedUrl = await getPresignedMediaUrl(mediaRequest.mediaUrl)
    const mediaStartedAt = Date.now()

    await twilioClient.messages.create({
      from: toWhatsappAddress(project.phoneNumber),
      to: toWhatsappAddress(to),
      body: project.flowMessage,
      mediaUrl: [presignedUrl],
    })

    pushIntegrationEvent(observability.wideEvent, {
      provider: 'twilio',
      operation,
      outcome: 'success',
      durationMs: Date.now() - mediaStartedAt,
    })

    const updatedRequest = await repository.updateStatus(mediaRequest.id, 'MEDIA_SENT')
    await recordZabbixMetricEvent({
      type: 'MEDIA_SENT',
      projectId: project.id,
      mediaRequestId: mediaRequest.id,
    })

    setMediaContext(observability.wideEvent, {
      status: 'MEDIA_SENT',
    })

    return updatedRequest
  } catch (error) {
    pushIntegrationEvent(observability.wideEvent, {
      provider: 'twilio',
      operation,
      outcome: 'error',
      code: buildErrorCode(error),
    })
    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'ExternalServiceError',
      code: 'media_send_failed',
      message: 'Failed to send media',
    })

    await repository.updateStatus(mediaRequest.id, 'MEDIA_SEND_FAILED')
    setMediaContext(observability.wideEvent, {
      status: 'MEDIA_SEND_FAILED',
    })

    throw new ApplicationError('Failed to send media', 502)
  }
}
