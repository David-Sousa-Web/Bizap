import type { FastifyRequest, FastifyReply } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function authJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()

    const userId = (request.user as { sub?: string }).sub

    if (!userId) {
      throw new Error('Missing user id in token')
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!user) {
      return reply.status(401).send({
        success: false,
        message: 'Unauthorized',
        data: null,
      })
    }
  } catch {
    return reply.status(401).send({
      success: false,
      message: 'Unauthorized',
      data: null,
    })
  }
}
