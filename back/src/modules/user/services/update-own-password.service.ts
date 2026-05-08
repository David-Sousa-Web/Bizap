import { compare, hash } from 'bcryptjs'
import {
  type ObservabilityContext,
  setErrorContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { UserRepository } from '../repositories/user-repository.js'
import type { UpdateOwnPasswordBody } from '../schemas/user.schema.js'

export async function updateOwnPasswordService(
  authenticatedUserId: string,
  data: UpdateOwnPasswordBody,
  repository: UserRepository,
  observability: ObservabilityContext,
) {
  const user = await repository.findById(authenticatedUserId)

  if (!user) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'user_not_found',
      message: 'User not found',
    })

    throw new ApplicationError('User not found', 404)
  }

  const passwordMatch = await compare(data.currentPassword, user.password)

  if (!passwordMatch) {
    setErrorContext(observability.wideEvent, {
      type: 'AuthenticationError',
      code: 'invalid_current_password',
      message: 'Invalid current password',
    })

    throw new ApplicationError('Invalid current password', 401)
  }

  const password = await hash(data.newPassword, 10)
  await repository.update(user.id, { password })
}
