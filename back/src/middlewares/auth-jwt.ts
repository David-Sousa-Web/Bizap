import type { FastifyRequest, FastifyReply } from 'fastify'

export async function authJwt(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.status(401).send({
      success: false,
      message: 'Unauthorized',
      data: null,
    })
  }
}
