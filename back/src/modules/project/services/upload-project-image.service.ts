import { randomUUID } from 'node:crypto'
import { Upload } from '@aws-sdk/lib-storage'
import { s3Client } from '../../../lib/s3.js'
import { env } from '../../../env.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { ProjectRepository } from '../repositories/project-repository.js'
import type { MultipartFile } from '@fastify/multipart'

export async function uploadProjectImageService(
  projectId: string,
  userId: string,
  file: MultipartFile,
  repository: ProjectRepository,
) {
  const project = await repository.findById(projectId)

  if (!project) {
    throw new ApplicationError('Project not found', 404)
  }

  if (project.userId !== userId) {
    throw new ApplicationError('Project not found', 404)
  }

  const extension = file.filename.split('.').pop() ?? 'png'
  const key = `bizap-projects/${projectId}/${randomUUID()}.${extension}`

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

  const imageUrl = `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`

  const updated = await repository.update(projectId, { image: imageUrl })

  return {
    id: updated.id,
    name: updated.name,
    image: updated.image,
    phoneNumber: updated.phoneNumber,
    agency: updated.agency,
    templateSid: updated.templateSid,
    flowMessage: updated.flowMessage,
    apiKey: updated.apiKey,
  }
}
