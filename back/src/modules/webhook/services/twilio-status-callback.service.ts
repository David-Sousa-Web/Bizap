import {
  type ObservabilityContext,
  setErrorContext,
  setMediaContext,
  setWebhookContext,
} from '../../../lib/wide-event.js'
import { PrismaMediaRepository } from '../../media/repositories/prisma-media-repository.js'

const TEMPLATE_FAILURE_STATUSES = new Set(['failed', 'undelivered'])

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
  const mediaRequest = await repository.findByTemplateMessageSid(messageSid)

  if (!mediaRequest) {
    return
  }

  setMediaContext(observability.wideEvent, {
    mediaRequestId: mediaRequest.id,
    status: mediaRequest.status,
  })
  setWebhookContext(observability.wideEvent, {
    previousStatus: mediaRequest.status,
  })

  await repository.updateTemplateTracking(mediaRequest.id, {
    twilioTemplateMessageStatus: messageStatus,
    twilioTemplateErrorCode: errorCode,
    twilioTemplateErrorMessage: errorMessage,
  })

  if (TEMPLATE_FAILURE_STATUSES.has(messageStatus)) {
    await repository.updateStatus(mediaRequest.id, 'TEMPLATE_SEND_FAILED')

    setMediaContext(observability.wideEvent, {
      status: 'TEMPLATE_SEND_FAILED',
    })
    setWebhookContext(observability.wideEvent, {
      nextStatus: 'TEMPLATE_SEND_FAILED',
    })
  }
}
