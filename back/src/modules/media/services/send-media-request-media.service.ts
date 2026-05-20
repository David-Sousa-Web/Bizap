import { prisma } from '../../../lib/prisma.js'
import { encryptionService } from '../../../lib/encryption.js'
import {
  maskActorPhone,
  type ObservabilityContext,
  setErrorContext,
  setMediaContext,
  setNumberContext,
  setProjectContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { MediaRepository } from '../repositories/media-repository.js'
import { sendMediaMessage } from './send-media-message.service.js'

export async function sendMediaRequestMediaService(
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

  if (!['TEMPLATE_SENT', 'MEDIA_SEND_FAILED'].includes(mediaRequest.status)) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'invalid_media_request_status',
      message: 'Media can only be sent for sent templates or media send failures',
    })

    throw new ApplicationError('Media can only be sent for sent templates or media send failures', 400)
  }

  const updatedRequest = await sendMediaMessage({
    mediaRequest,
    project: mediaRequest.project,
    to: decryptedNumber,
    repository,
    observability,
    operation: 'send_media_direct',
  })

  return {
    id: updatedRequest.id,
    mediaUrl: updatedRequest.mediaUrl,
    status: updatedRequest.status,
    numberId: updatedRequest.numberId,
    projectId: updatedRequest.projectId,
  }
}
