import { compare } from 'bcryptjs'
import { prisma } from '../../../lib/prisma.js'
import {
  maskActorEmail,
  type ObservabilityContext,
  setActorContext,
  setErrorContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { LoginBody } from '../schemas/auth.schema.js'

export async function loginService(data: LoginBody, observability: ObservabilityContext) {
  setActorContext(observability.wideEvent, {
    authType: 'password',
    emailMasked: maskActorEmail(data.email),
  })

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  })

  if (!user) {
    setErrorContext(observability.wideEvent, {
      type: 'AuthenticationError',
      code: 'invalid_credentials',
      message: 'Invalid credentials',
    })

    throw new ApplicationError('Invalid credentials', 401)
  }

  const passwordMatch = await compare(data.password, user.password)

  if (!passwordMatch) {
    setActorContext(observability.wideEvent, {
      userId: user.id,
    })
    setErrorContext(observability.wideEvent, {
      type: 'AuthenticationError',
      code: 'invalid_credentials',
      message: 'Invalid credentials',
    })

    throw new ApplicationError('Invalid credentials', 401)
  }

  setActorContext(observability.wideEvent, {
    userId: user.id,
    emailMasked: maskActorEmail(user.email),
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}
