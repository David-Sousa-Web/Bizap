import {
  type ObservabilityContext,
  setErrorContext,
  setMediaContext,
  setWebhookContext,
} from '../../../lib/wide-event.js'
import { PrismaMediaRepository } from '../../media/repositories/prisma-media-repository.js'
import { prisma } from '../../../lib/prisma.js'
import { recordZabbixMetricEvent } from '../../metrics/services/record-zabbix-metric-event.js'

const TEMPLATE_FAILURE_STATUSES = new Set(['failed', 'undelivered'])
const TEMPLATE_SUCCESS_STATUSES = new Set(['sent', 'delivered', 'read'])
const CALLBACK_MUTABLE_STATUSES = new Set(['PENDING', 'TEMPLATE_SENT', 'RECONFIRMATION_SENT', 'DECLINED'])

export type TwilioStatusCallbackPayload = {
  MessageSid?: unknown
  MessageStatus?: unknown
  SmsSid?: unknown
  SmsStatus?: unknown
  ErrorCode?: unknown
  ErrorMessage?: unknown
}

function toOptionalString(value: unknown) {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value.trim()
  }

  if (typeof value === 'number') {
    return String(value)
  }

  return null
}

function getSuccessStatus(currentStatus: string) {
  return currentStatus === 'DECLINED' ? 'RECONFIRMATION_SENT' : 'TEMPLATE_SENT'
}

export async function twilioStatusCallbackService(
  payload: TwilioStatusCallbackPayload,
  observability: ObservabilityContext,
) {
  const messageSid = toOptionalString(payload.MessageSid) ?? toOptionalString(payload.SmsSid)
  const rawMessageStatus = toOptionalString(payload.MessageStatus)
    ?? toOptionalString(payload.SmsStatus)
  const messageStatus = rawMessageStatus?.toLowerCase() ?? null
  const errorCode = toOptionalString(payload.ErrorCode)
  const errorMessage = toOptionalString(payload.ErrorMessage)

  setWebhookContext(observability.wideEvent, {
    replyCategory: 'unknown',
  })

  if (!messageSid || !messageStatus) {
    setErrorContext(observability.wideEvent, {
      type: 'ValidationError',
      code: 'invalid_twilio_status_callback',
      message: 'Twilio status callback missing MessageSid or MessageStatus',
    })

    return
  }

  const repository = new PrismaMediaRepository()
  const mediaRequests = await repository.findManyByTemplateMessageSid(messageSid)

  if (mediaRequests.length === 0) {
    return
  }

  const [firstMediaRequest] = mediaRequests

  setMediaContext(observability.wideEvent, {
    mediaRequestId: firstMediaRequest.id,
    status: firstMediaRequest.status,
  })
  setWebhookContext(observability.wideEvent, {
    previousStatus: firstMediaRequest.status,
  })

  await Promise.all(mediaRequests.map((mediaRequest) => (
    repository.updateTemplateTracking(mediaRequest.id, {
      twilioTemplateMessageStatus: messageStatus,
      twilioTemplateErrorCode: errorCode,
      twilioTemplateErrorMessage: errorMessage,
    })
  )))

  const mutableMediaRequests = mediaRequests.filter((mediaRequest) => (
    CALLBACK_MUTABLE_STATUSES.has(mediaRequest.status)
  ))

  if (TEMPLATE_FAILURE_STATUSES.has(messageStatus)) {
    await Promise.all(mutableMediaRequests.map((mediaRequest) => (
      repository.updateStatus(mediaRequest.id, 'TEMPLATE_SEND_FAILED')
    )))
    setMediaContext(observability.wideEvent, {
      status: 'TEMPLATE_SEND_FAILED',
    })
    setWebhookContext(observability.wideEvent, {
      nextStatus: 'TEMPLATE_SEND_FAILED',
    })
  }

  if (TEMPLATE_SUCCESS_STATUSES.has(messageStatus)) {
    await Promise.all(mutableMediaRequests.map((mediaRequest) => (
      repository.updateStatus(
        mediaRequest.id,
        getSuccessStatus(mediaRequest.status),
      )
    )))

    const metricAlreadyRecorded = await prisma.zabbixMetricEvent.findFirst({
      where: {
        type: 'TEMPLATE_SENT',
        mediaRequestId: {
          in: mediaRequests.map((mediaRequest) => mediaRequest.id),
        },
      },
      select: {
        id: true,
      },
    })

    const metricMediaRequest = mutableMediaRequests[0]

    if (!metricAlreadyRecorded && metricMediaRequest) {
      await recordZabbixMetricEvent({
        type: 'TEMPLATE_SENT',
        projectId: metricMediaRequest.projectId,
        mediaRequestId: metricMediaRequest.id,
      })
    }

    const nextStatus = metricMediaRequest
      ? getSuccessStatus(metricMediaRequest.status)
      : 'TEMPLATE_SENT'
    setMediaContext(observability.wideEvent, {
      status: nextStatus,
    })
    setWebhookContext(observability.wideEvent, {
      nextStatus,
    })
  }
}
