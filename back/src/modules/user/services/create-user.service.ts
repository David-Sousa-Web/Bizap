import { Prisma } from '@prisma/client'
import { hash } from 'bcryptjs'
import {
  maskActorEmail,
  type ObservabilityContext,
  setErrorContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { CreateUserBody } from '../schemas/user.schema.js'
import type { UserRepository } from '../repositories/user-repository.js'
import { presentUser } from './user-presenter.js'

export async function createUserService(
  data: CreateUserBody,
  repository: UserRepository,
  observability: ObservabilityContext,
) {
  try {
    const password = await hash(data.password, 10)
    const user = await repository.create({
      name: data.name,
      email: data.email,
      password,
      role: data.role ?? 'USER',
    })

    return presentUser(user)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      setErrorContext(observability.wideEvent, {
        type: 'ApplicationError',
        code: 'user_email_conflict',
        message: 'User email already exists',
      })

      throw new ApplicationError('User email already exists', 409)
    }

    setErrorContext(observability.wideEvent, {
      type: error instanceof Error ? error.name : 'UserCreationError',
      code: 'user_create_failed',
      message: `Failed to create user ${maskActorEmail(data.email)}`,
    })
    throw new ApplicationError('Failed to create user', 500)
  }
}
