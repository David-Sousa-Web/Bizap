import { Prisma } from '@prisma/client'
import {
  type ObservabilityContext,
  setErrorContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { UpdateUserBody } from '../schemas/user.schema.js'
import type { UserRepository } from '../repositories/user-repository.js'
import { presentUser } from './user-presenter.js'

export async function updateUserService(
  id: string,
  data: UpdateUserBody,
  repository: UserRepository,
  observability: ObservabilityContext,
) {
  const user = await repository.findById(id)

  if (!user) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'user_not_found',
      message: 'User not found',
    })

    throw new ApplicationError('User not found', 404)
  }

  try {
    const updated = await repository.update(id, data)

    return presentUser(updated)
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
      type: error instanceof Error ? error.name : 'UserUpdateError',
      code: 'user_update_failed',
      message: 'Failed to update user',
    })
    throw new ApplicationError('Failed to update user', 500)
  }
}
