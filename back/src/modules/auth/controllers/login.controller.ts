import type { FastifyRequest, FastifyReply } from 'fastify'
import { loginService } from '../services/login.service.js'
import type { LoginBody } from '../schemas/auth.schema.js'

export async function loginController(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
) {
  const user = await loginService(request.body)

  const token = await reply.jwtSign(
    { sub: user.id, email: user.email },
    { expiresIn: '7d' },
  )

  return reply.status(200).send({
    success: true,
    message: 'Login successful',
    data: { token },
  })
}
