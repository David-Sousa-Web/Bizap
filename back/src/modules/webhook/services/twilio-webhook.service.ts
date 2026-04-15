import { twilioClient } from '../../../lib/twilio.js'
import { env } from '../../../env.js'
import { prisma } from '../../../lib/prisma.js'
import { getPresignedMediaUrl } from '../../../lib/s3.js'
import { PrismaMediaRepository } from '../../media/repositories/prisma-media-repository.js'

export async function twilioWebhookService(
  from: string,
  body: string,
) {
  const phoneNumber = from.replace('whatsapp:', '')

  const number = await prisma.number.findFirst({
    where: { number: phoneNumber },
  })

  if (!number) {
    return
  }

  const repository = new PrismaMediaRepository()
  const mediaRequest = await repository.findPendingByNumberId(number.id)

  if (!mediaRequest) {
    return
  }

  const isConfirmation = body.trim().toLowerCase() === 'sim' ||
    body.trim().toLowerCase() === 'yes'

  if (!isConfirmation) {
    return
  }

  await repository.updateStatus(mediaRequest.id, 'CONFIRMED')

  const project = await prisma.project.findUnique({
    where: { id: mediaRequest.projectId },
  })

  if (!project) {
    return
  }

  try {
    const presignedUrl = await getPresignedMediaUrl(mediaRequest.mediaUrl)

    await twilioClient.messages.create({
      from: `whatsapp:${env.TWILIO_PHONE_NUMBER}`,
      to: from,
      body: project.flowMessage,
    })

    await twilioClient.messages.create({
      from: `whatsapp:${env.TWILIO_PHONE_NUMBER}`,
      to: from,
      mediaUrl: [presignedUrl],
    })

    await repository.updateStatus(mediaRequest.id, 'MEDIA_SENT')
  } catch {
    await repository.updateStatus(mediaRequest.id, 'FAILED')
  }
}
