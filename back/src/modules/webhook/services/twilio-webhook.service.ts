import { twilioClient } from '../../../lib/twilio.js'
import { prisma } from '../../../lib/prisma.js'
import { getPresignedMediaUrl } from '../../../lib/s3.js'
import {
  buildErrorCode,
  maskActorPhone,
  type ObservabilityContext,
  pushIntegrationEvent,
  setErrorContext,
  setMediaContext,
  setNumberContext,
  setProjectContext,
  setWebhookContext,
} from '../../../lib/wide-event.js'
import { PrismaMediaRepository } from '../../media/repositories/prisma-media-repository.js'
import {
  DECLINED_EXPIRATION_HOURS,
  DECLINE_REPLY_MESSAGE,
  INVALID_REPLY_LIMIT,
  INVALID_REPLY_MESSAGE,
  isDeclineMediaConfirmationReply,
  isValidMediaConfirmationReply,
} from '../utils/media-confirmation.js'

export async function twilioWebhookService(
  from: string,
  body: string,
  observability: ObservabilityContext,
) {
  const rawPhone = from.replace('whatsapp:', '')
  const phoneWithPlus = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`
  const phoneWithoutPlus = rawPhone.replace('+', '')
  const phoneFilter = [{ number: phoneWithPlus }, { number: phoneWithoutPlus }]

  setWebhookContext(observability.wideEvent, {
    fromMasked: maskActorPhone(rawPhone),
    bodyLength: body.trim().length,
  })

  const mediaRequestWithNumber = await prisma.mediaRequest.findFirst({
    where: {
      status: { in: ['PENDING', 'TEMPLATE_SENT', 'DECLINED', 'RECONFIRMATION_SENT'] },
      number: {
        is: {
          OR: phoneFilter,
        },
      },
    },
    include: {
      number: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  if (!mediaRequestWithNumber) {
    const number = await prisma.number.findFirst({
      where: {
        OR: phoneFilter,
      },
    })

    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: number ? 'pending_media_request_not_found' : 'webhook_number_not_found',
      message: number ? 'No pending media request for webhook' : 'Webhook number not found',
    })

    return
  }

  const repository = new PrismaMediaRepository()
  const { number, ...mediaRequest } = mediaRequestWithNumber

  setNumberContext(observability.wideEvent, {
    bizapId: number.id,
    numberMasked: maskActorPhone(number.number),
    numberName: number.name,
  })

  setMediaContext(observability.wideEvent, {
    mediaRequestId: mediaRequest.id,
    status: mediaRequest.status,
    storage: 's3',
  })
  setWebhookContext(observability.wideEvent, {
    previousStatus: mediaRequest.status,
  })

  const project = await prisma.project.findUnique({
    where: { id: mediaRequest.projectId },
  })

  if (!project) {
    setProjectContext(observability.wideEvent, {
      projectId: mediaRequest.projectId,
    })
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'project_not_found',
      message: 'Project not found while processing webhook',
    })

    return
  }

  setProjectContext(observability.wideEvent, {
    projectId: project.id,
    projectName: project.name,
    phoneNumberMasked: maskActorPhone(project.phoneNumber),
  })

  const twilioFrom = `whatsapp:${project.phoneNumber}`

  if (mediaRequest.status === 'DECLINED') {
    const expirationMs = DECLINED_EXPIRATION_HOURS * 60 * 60 * 1000
    const isExpired = Date.now() - mediaRequest.updatedAt.getTime() > expirationMs

    if (isExpired) {
      setWebhookContext(observability.wideEvent, {
        replyCategory: 'decline',
        nextStatus: mediaRequest.status,
      })
      setErrorContext(observability.wideEvent, {
        type: 'ApplicationError',
        code: 'decline_window_expired',
        message: 'Decline reconfirmation window expired',
      })

      return
    }

    const startedAt = Date.now()

    try {
      await twilioClient.messages.create({
        from: twilioFrom,
        to: from,
        contentSid: project.templateSid,
      })

      await repository.resetForReconfirmation(mediaRequest.id)

      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'resend_template',
        outcome: 'success',
        durationMs: Date.now() - startedAt,
      })
      setWebhookContext(observability.wideEvent, {
        replyCategory: 'decline',
        nextStatus: 'RECONFIRMATION_SENT',
      })
      setMediaContext(observability.wideEvent, {
        status: 'RECONFIRMATION_SENT',
      })
    } catch (error) {
      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'resend_template',
        outcome: 'error',
        durationMs: Date.now() - startedAt,
        code: buildErrorCode(error),
      })
      setErrorContext(observability.wideEvent, {
        type: error instanceof Error ? error.name : 'ExternalServiceError',
        code: 'twilio_reconfirmation_failed',
        message: 'Failed to resend template after decline',
      })
    }

    return
  }

  const normalizedBody = body
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  if (isValidMediaConfirmationReply(normalizedBody)) {
    await repository.updateStatus(mediaRequest.id, 'CONFIRMED')
    setWebhookContext(observability.wideEvent, {
      replyCategory: 'confirm',
      nextStatus: 'MEDIA_SENT',
    })
    setMediaContext(observability.wideEvent, {
      status: 'CONFIRMED',
    })

    try {
      const presignedUrl = await getPresignedMediaUrl(mediaRequest.mediaUrl)

      const mediaStartedAt = Date.now()
      await twilioClient.messages.create({
        from: twilioFrom,
        to: from,
        body: project.flowMessage,
        mediaUrl: [presignedUrl],
      })
      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'send_media_with_message',
        outcome: 'success',
        durationMs: Date.now() - mediaStartedAt,
      })

      await repository.updateStatus(mediaRequest.id, 'MEDIA_SENT')
      setMediaContext(observability.wideEvent, {
        status: 'MEDIA_SENT',
      })
    } catch (error) {
      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'send_confirmed_media',
        outcome: 'error',
        code: buildErrorCode(error),
      })
      setErrorContext(observability.wideEvent, {
        type: error instanceof Error ? error.name : 'ExternalServiceError',
        code: 'confirmed_media_delivery_failed',
        message: 'Failed to send confirmed media reply',
      })
      await repository.updateStatus(mediaRequest.id, 'FAILED')
      setWebhookContext(observability.wideEvent, {
        nextStatus: 'FAILED',
      })
      setMediaContext(observability.wideEvent, {
        status: 'FAILED',
      })
    }

    return
  }

  if (isDeclineMediaConfirmationReply(normalizedBody)) {
    setWebhookContext(observability.wideEvent, {
      replyCategory: 'decline',
    })

    if (mediaRequest.status === 'RECONFIRMATION_SENT') {
      await repository.updateStatus(mediaRequest.id, 'INVALID_RESPONSE_LIMIT')
      setWebhookContext(observability.wideEvent, {
        nextStatus: 'INVALID_RESPONSE_LIMIT',
      })
      setMediaContext(observability.wideEvent, {
        status: 'INVALID_RESPONSE_LIMIT',
      })

      return
    }

    await repository.updateStatus(mediaRequest.id, 'DECLINED')
    setWebhookContext(observability.wideEvent, {
      nextStatus: 'DECLINED',
    })
    setMediaContext(observability.wideEvent, {
      status: 'DECLINED',
    })

    const startedAt = Date.now()
    try {
      await twilioClient.messages.create({
        from: twilioFrom,
        to: from,
        body: DECLINE_REPLY_MESSAGE,
      })
      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'send_decline_reply',
        outcome: 'success',
        durationMs: Date.now() - startedAt,
      })
    } catch (error) {
      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'send_decline_reply',
        outcome: 'error',
        durationMs: Date.now() - startedAt,
        code: buildErrorCode(error),
      })
      setErrorContext(observability.wideEvent, {
        type: error instanceof Error ? error.name : 'ExternalServiceError',
        code: 'decline_reply_send_failed',
        message: 'Failed to send decline reply',
      })
      throw error
    }

    return
  }

  const nextInvalidReplyCount = mediaRequest.invalidReplyCount + 1
  const shouldClose = nextInvalidReplyCount >= INVALID_REPLY_LIMIT

  const updatedRequest = await repository.registerInvalidReply(
    mediaRequest.id,
    shouldClose ? 'INVALID_RESPONSE_LIMIT' : undefined,
  )

  setWebhookContext(observability.wideEvent, {
    replyCategory: 'unknown',
    nextStatus: updatedRequest.status,
  })
  setMediaContext(observability.wideEvent, {
    status: updatedRequest.status,
  })

  if (!shouldClose) {
    const startedAt = Date.now()

    try {
      await twilioClient.messages.create({
        from: twilioFrom,
        to: from,
        body: INVALID_REPLY_MESSAGE,
      })
      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'send_invalid_reply_prompt',
        outcome: 'success',
        durationMs: Date.now() - startedAt,
      })
    } catch (error) {
      pushIntegrationEvent(observability.wideEvent, {
        provider: 'twilio',
        operation: 'send_invalid_reply_prompt',
        outcome: 'error',
        durationMs: Date.now() - startedAt,
        code: buildErrorCode(error),
      })
      setErrorContext(observability.wideEvent, {
        type: error instanceof Error ? error.name : 'ExternalServiceError',
        code: 'invalid_reply_prompt_failed',
        message: 'Failed to send invalid reply prompt',
      })
      throw error
    }
  }
}
