import type { FastifyReply, FastifyRequest } from 'fastify'
import type { UserRole } from '@prisma/client'
import { setErrorContext } from '../lib/wide-event.js'

export function requireRole(...allowedRoles: UserRole[]) {
  return async function roleGuard(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as { role?: UserRole }

    if (!user.role || !allowedRoles.includes(user.role)) {
      setErrorContext(request.wideEvent, {
        type: 'AuthorizationError',
        code: 'forbidden',
        message: 'Forbidden',
      })

      return reply.status(403).send({
        success: false,
        message: 'Forbidden',
        data: null,
      })
    }
  }
}
