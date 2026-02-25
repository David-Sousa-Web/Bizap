import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function authApiKey(request: FastifyRequest, reply: FastifyReply) {
  const apiKey = request.headers['x-api-key'] as string | undefined
  const { projectId } = request.params as { projectId: string }

  if (!apiKey) {
    return reply.status(401).send({
      success: false,
      message: 'API key is required',
      data: null,
    })
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project || project.apiKey !== apiKey) {
    return reply.status(401).send({
      success: false,
      message: 'Invalid API key',
      data: null,
    })
  }

  ;(request as any).project = project
}
