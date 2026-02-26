import { ApplicationError } from '../../../utils/errors.js'
import { twilioClient } from '../../../lib/twilio.js'
import { env } from '../../../env.js'
import { prisma } from '../../../lib/prisma.js'
import type { MediaRepository } from '../repositories/media-repository.js'

export async function sendMediaService(
  projectId: string,
  bizapId: string,
  mediaUrl: string,
  repository: MediaRepository,
) {
  const number = await prisma.number.findUnique({
    where: { id: bizapId },
  })

  if (!number || number.projectId !== projectId) {
    throw new ApplicationError('Number not found in this project', 404)
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    throw new ApplicationError('Project not found', 404)
  }

  const mediaRequest = await repository.create({
    mediaUrl,
    numberId: bizapId,
    projectId,
  })

  try {
    await twilioClient.messages.create({
      from: `whatsapp:${env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${number.number}`,
      contentSid: project.templateSid,
    })

    await repository.updateStatus(mediaRequest.id, 'TEMPLATE_SENT')
  } catch {
    await repository.updateStatus(mediaRequest.id, 'FAILED')
    throw new ApplicationError('Failed to send template via Twilio', 502)
  }

  return { ...mediaRequest, status: 'TEMPLATE_SENT' }
}
