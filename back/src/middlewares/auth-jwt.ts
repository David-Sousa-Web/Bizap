import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'
import {
  markUnauthorizedJwt,
  setActorFromJwtPayload,
  setErrorContext,
} from '../lib/wide-event.js'

export async function authJwt(request: FastifyRequest, reply: FastifyReply) {
  request.wideEvent.module ??= 'auth'
  request.wideEvent.operation ??= 'jwt-guard'

  try {
    await request.jwtVerify()

    const payload = request.user as { sub?: string; email?: string }
    const userId = payload.sub

    setActorFromJwtPayload(request.wideEvent, payload)

    if (!userId) {
      markUnauthorizedJwt(request.wideEvent)
      throw new Error('Missing user id in token')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      markUnauthorizedJwt(request.wideEvent)
      return reply.status(401).send({
        success: false,
        message: 'Unauthorized',
        data: null,
      })
    }
  } catch (error) {
    markUnauthorizedJwt(request.wideEvent)
    setErrorContext(request.wideEvent, {
      type: error instanceof Error ? error.name : 'AuthenticationError',
      code: 'invalid_jwt',
      message: 'Unauthorized',
    })

    return reply.status(401).send({
      success: false,
      message: 'Unauthorized',
      data: null,
    })
  }
}
