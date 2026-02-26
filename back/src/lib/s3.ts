import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { env } from '../env.js'

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function getMediaBuffer(mediaUrl: string): Promise<Buffer> {
  const url = new URL(mediaUrl)
  const key = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname

  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
  })

  const response = await s3Client.send(command)
  const stream = response.Body

  if (!stream) {
    throw new Error('Empty response from S3')
  }

  const chunks: Uint8Array[] = []
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }

  return Buffer.concat(chunks)
}
