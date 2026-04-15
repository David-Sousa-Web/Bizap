import type { FastifyRequest, FastifyReply } from 'fastify'
import { createObservabilityContext, setActorContext } from '../../../lib/wide-event.js'
import { loginService } from '../services/login.service.js'
import type { LoginBody } from '../schemas/auth.schema.js'

export async function loginController(
  request: FastifyRequest<{ Body: LoginBody }>,
  reply: FastifyReply,
) {
  const observability = createObservabilityContext(request, {
    module: 'auth',
    operation: 'login',
  })

  setActorContext(observability.wideEvent, { authType: 'password' })

  const user = await loginService(request.body, observability)

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
