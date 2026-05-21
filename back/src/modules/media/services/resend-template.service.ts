import type { MediaRequestStatus } from '@prisma/client'
import { prisma } from '../../../lib/prisma.js'
import { twilioClient } from '../../../lib/twilio.js'
import { encryptionService } from '../../../lib/encryption.js'
import { env } from '../../../env.js'
import {
  buildErrorCode,
  maskActorPhone,
  type ObservabilityContext,
  pushIntegrationEvent,
  setErrorContext,
  setMediaContext,
  setNumberContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import { recordZabbixMetricEvent } from '../../metrics/services/record-zabbix-metric-event.js'
import type { MediaRepository } from '../repositories/media-repository.js'

const RESEND_TEMPLATE_ALLOWED_STATUSES = new Set<MediaRequestStatus>([
  'TEMPLATE_SEND_FAILED',
  'INVALID_RESPONSE_LIMIT',
])
const RESEND_TEMPLATE_INVALID_STATUS_MESSAGE = 'Template can only be resent for template send failures or invalid response limits'

export async function resendTemplateService(
  projectId: string,
  mediaRequestId: string,
  repository: MediaRepository,
  observability: ObservabilityContext,
) {
  setProjectContext(observability.wideEvent, { projectId })
  setMediaContext(observability.wideEvent, { mediaRequestId })

  const mediaRequest = await prisma.mediaRequest.findUnique({
    where: { id: mediaRequestId },
    include: {
      number: true,
      project: true,
    },
  })

  if (!mediaRequest || mediaRequest.projectId !== projectId) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'media_request_not_found',
      message: 'Media request not found in this project',
    })

    throw new ApplicationError('Media request not found in this project', 404)
  }

  const decryptedNumberName = encryptionService.decrypt(mediaRequest.number.name)
  const decryptedNumber = encryptionService.decrypt(mediaRequest.number.number)

  setProjectContext(observability.wideEvent, {
    projectId: mediaRequest.project.id,
    projectName: mediaRequest.project.name,
    phoneNumberMasked: maskActorPhone(mediaRequest.project.phoneNumber),
  })
  setNumberContext(observability.wideEvent, {
    bizapId: mediaRequest.number.id,
    numberMasked: maskActorPhone(decryptedNumber),
    numberName: decryptedNumberName,
  })
  setMediaContext(observability.wideEvent, {
    mediaRequestId: mediaRequest.id,
    status: mediaRequest.status,
    storage: 's3',
  })

  if (!RESEND_TEMPLATE_ALLOWED_STATUSES.has(mediaRequest.status)) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'invalid_media_request_status',
      message: RESEND_TEMPLATE_INVALID_STATUS_MESSAGE,
    })

    throw new ApplicationError(RESEND_TEMPLATE_INVALID_STATUS_MESSAGE, 400)
  }

  const startedAt = Date.now()

  try {
    const message = await twilioClient.messages.create({
      from: `whatsapp:${mediaRequest.project.phoneNumber}`,
      to: `whatsapp:${decryptedNumber}`,
      contentSid: mediaRequest.project.templateSid,
      statusCallback: `${env.API_BASE_URL}/v1/webhook/twilio/status`,
    })

    await repository.updateTemplateTracking(mediaRequest.id, {
      twilioTemplateMessageSid: message.sid,
      twilioTemplateMessageStatus: message.status ?? null,
      twilioTemplateErrorCode: null,
      twilioTemplateErrorMessage: null,
    })
    const updatedRequest = await prisma.mediaRequest.update({
      where: { id: mediaRequest.id },
      data: {
        status: 'TEMPLATE_SENT',
        invalidReplyCount: 0,
        lastInvalidReplyAt: null,
      },
    })
    await recordZabbixMetricEvent({
      type: 'TEMPLATE_SENT',
      projectId: mediaRequest.projectId,
      mediaRequestId: mediaRequest.id,
    })

    pushIntegrationEvent(observability.wideEvent, {
      provider: 'twilio',
      operation: 'resend_template',
      outcome: 'success',
      durationMs: Date.now() - startedAt,
    })
    setMediaContext(observability.wideEvent, {
      status: 'TEMPLATE_SENT',
    })

    return {
      id: updatedRequest.id,
      mediaUrl: updatedRequest.mediaUrl,
      status: updatedRequest.status,
      numberId: updatedRequest.numberId,
      projectId: updatedRequest.projectId,
    }
  } catch (error) {
    await repository.updateStatus(mediaRequest.id, 'TEMPLATE_SEND_FAILED')
    pushIntegrationEvent(observability.wideEvent, {
      provider: 'twilio',
      operation: 'resend_template',
      outcome: 'error',
      durationMs: Date.now() - startedAt,
      code: buildErrorCode(error),
    })
    setMediaContext(observability.wideEvent, {
      status: 'TEMPLATE_SEND_FAILED',
    })
    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'ExternalServiceError',
      code: 'twilio_template_resend_failed',
      message: 'Failed to resend template via Twilio',
    })

    throw new ApplicationError('Failed to resend template via Twilio', 502)
  }
}
