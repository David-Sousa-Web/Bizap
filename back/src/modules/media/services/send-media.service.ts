import { randomUUID } from 'node:crypto'
import { Upload } from '@aws-sdk/lib-storage'
import type { MultipartFile } from '@fastify/multipart'
import { s3Client } from '../../../lib/s3.js'
import { ApplicationError } from '../../../utils/errors.js'
import { twilioClient } from '../../../lib/twilio.js'
import { env } from '../../../env.js'
import { prisma } from '../../../lib/prisma.js'
import type { MediaRepository } from '../repositories/media-repository.js'

export async function sendMediaService(
  projectId: string,
  bizapId: string,
  file: MultipartFile,
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

  await upload.done()

  const mediaUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

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

  return {
    id: mediaRequest.id,
    mediaUrl: mediaRequest.mediaUrl,
    status: 'TEMPLATE_SENT',
    numberId: mediaRequest.numberId,
    projectId: mediaRequest.projectId,
  }
}
