import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'
import {
  markUnauthorizedApiKey,
  setActorContext,
  setErrorContext,
  setProjectContext,
} from '../lib/wide-event.js'

export async function authApiKey(request: FastifyRequest, reply: FastifyReply) {
  request.wideEvent.module ??= 'auth'
  request.wideEvent.operation ??= 'api-key-guard'

  const apiKey = request.headers['x-api-key'] as string | undefined
  const { projectId } = request.params as { projectId: string }

  markUnauthorizedApiKey(request.wideEvent, projectId)

  if (!apiKey) {
    setErrorContext(request.wideEvent, {
      type: 'AuthenticationError',
      code: 'missing_api_key',
      message: 'API key is required',
    })

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
    setErrorContext(request.wideEvent, {
      type: 'AuthenticationError',
      code: 'invalid_api_key',
      message: 'Invalid API key',
    })

    return reply.status(401).send({
      success: false,
      message: 'Invalid API key',
      data: null,
    })
  }

  setActorContext(request.wideEvent, { authType: 'api_key' })
  setProjectContext(request.wideEvent, {
    projectId: project.id,
    projectName: project.name,
  })
  ;(request as any).project = project
}
