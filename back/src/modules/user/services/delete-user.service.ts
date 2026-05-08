import {
  type ObservabilityContext,
  setErrorContext,
} from '../../../lib/wide-event.js'
import { ApplicationError } from '../../../utils/errors.js'
import type { UserRepository } from '../repositories/user-repository.js'

export async function deleteUserService(
  id: string,
  authenticatedUserId: string,
  repository: UserRepository,
  observability: ObservabilityContext,
) {
  if (id === authenticatedUserId) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'user_self_delete_not_allowed',
      message: 'You cannot delete your own user',
    })

    throw new ApplicationError('You cannot delete your own user', 400)
  }

  const user = await repository.findById(id)

  if (!user) {
    setErrorContext(observability.wideEvent, {
      type: 'ApplicationError',
      code: 'user_not_found',
      message: 'User not found',
    })

    throw new ApplicationError('User not found', 404)
  }

  await repository.delete(id)
}
